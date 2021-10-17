import type {NextApiRequest, NextApiResponse} from 'next';
import { DefaultResponseMsg } from '../../types/DefaultResponseMsg';
import { Task } from '../../types/Task';
import { TaskModel } from '../../models/TaskModel';
import { UserModel } from '../../models/UserModel';
import { GetTaskQueryParams } from '../../types/GetTaskQueryParams';
import jwtValidator from '../../middlewares/jwtValidator';
import connectDB from '../../middlewares/connectDB';
import moment from 'moment';

const handler = async (req: NextApiRequest, res: NextApiResponse<DefaultResponseMsg | Task[]>) => {
    try {
        const userId = req?.body?.userId ? req?.body?.userId : req?.query?.userId as string;
        const failedValidation = await validateUser(userId);

        if (failedValidation) {
            return res.status(400).json({ error: failedValidation });
        }
        if (req.method === 'POST') {
            return await saveTask(req, res, userId);
        } else if (req.method === 'GET') {
            return await getTasks(req, res, userId);
        } else if (req.method === 'PUT') {
            return await updateTask(req, res, userId);
        } else if (req.method === 'DELETE') {
            return await deleteTask(req, res, userId);
        }

        res.status(400).json({ error: 'Método solicitado não existe.' });
    } catch (e) {
        console.log('Ocorreu erro ao gerenciar tarefas: ', e);
        res.status(500).json({ error: 'Ocorreu erro ao gerenciar tarefas, tente novamente.' });
    }
}

const validateTaskAndReturnValue = async (req: NextApiRequest, userId: string) => {
    const id = req.query?.id as string;

    if (!id || id.trim() === '') {
        return null;
    }

    const taskFound = await TaskModel.findById(id);

    if (!taskFound || taskFound.userId !== userId) {
        return null;
    }

    return taskFound;
}

const updateTask = async (req: NextApiRequest, res: NextApiResponse<DefaultResponseMsg | Task[]>, userId: string) => {
    const taskFound = await validateTaskAndReturnValue(req, userId);

    if (!taskFound) {
        return res.status(400).json({ error: 'Tarefa não encontrada.' });
    }

    if (req.body) {
        const task = req.body as Task;

        if (task.name && task.name.trim() !== '') {
            taskFound.name = task.name;
        }

        if (task.finishPrevisionDate) {
            taskFound.finishPrevisionDate = task.finishPrevisionDate;
        }

        if (task.finishDate) {
            taskFound.finishDate = task.finishDate;
        }

        await TaskModel.findByIdAndUpdate({ _id: taskFound._id}, taskFound);
        return res.status(200).json({ msg: 'Tarefa atualizada com sucesso.' });
    }

    return res.status(400).json({ error: 'Parâmetros de entrada inválidos.' });
}

const deleteTask = async (req: NextApiRequest, res: NextApiResponse<DefaultResponseMsg | Task[]>, userId: string) => {
    const taskFound = await validateTaskAndReturnValue(req, userId);

    if (!taskFound) {
        return res.status(400).json({ error: 'Tarefa não encontrada.' });
    }

    await TaskModel.findByIdAndDelete({ _id: taskFound._id });
    return res.status(200).json({ msg: 'Tarefa deletada com sucesso.' });
}

const getTasks = async (req: NextApiRequest, res: NextApiResponse<DefaultResponseMsg | Task[]>, userId: string) => {
    const params = req.query as GetTaskQueryParams;
    const query = { userId } as any;

    if (params?.finishPrevisionStart) {
        const inputDate = new Date(params?.finishPrevisionStart);
        query.finishPrevisionDate = { $gte: inputDate }
    }

    if (params?.finishPrevisionEnd) {
        const lastDate = new Date(params?.finishPrevisionEnd);

        if (!query.finishPrevisionDate) {
            query.finishPrevisionDate = {};
        }
        query.finishPrevisionDate.$lte = lastDate;
    }

    /*if (params?.status) {
        switch(params?.status) {
            case TaskStatusEnum.ATIVOS: 
                console.log('switch 1');
                query.finishDate = null;
                break;
            case TaskStatusEnum.CONCLUIDOS: 
                console.log('switch 2');
                query.finishDate = { $ne: null };
                break;
            default: 
                console.log('switch 3');
                break;
        }
    }*/

    if (params?.status) {
		const status = parseInt(params?.status);
		switch (status) {
			case 1:
				console.log('switch 1');
				query.finishDate = null;
				break;
			case 2:
				console.log('switch 2');
				query.finishDate = { $ne: null };
				break;
			default: break;
		}
	}

    console.log('query', query);
    const result = await TaskModel.find(query) as Task[];
    console.log('result', result);
    return res.status(200).json(result);
}

const validateUser = async (userId: string) => {
    if (!userId) {
		return 'Usuário não informado';
	}

	const userFound = await UserModel.findById(userId);
	if (!userFound) {
		return 'Usuário não encontrado';
	}
}

const saveTask = async (req: NextApiRequest, res: NextApiResponse<DefaultResponseMsg>, userId: string) => {
    if (req.body) {
        const task = req.body as Task;

        if (!task.name || task.name.length < 2) {
            return res.status(400).json({ error: 'Nome da tarefa inválida.' });
        }

        if (!task.finishPrevisionDate || moment(task.finishPrevisionDate).isBefore(moment())) {
            return res.status(400).json({ error: 'Data de previsão inválida ou menor que hoje.' });
        }
        const final = {
            ...task,
            userId,
            finishDate: undefined
        } as Task;

        await TaskModel.create(final);
        return res.status(200).json({ msg : 'Tarefa criada com sucesso!'});
    }
    return res.status(400).json({ error: 'Parâmetros de entrada inválidos.' });
}

export default connectDB(jwtValidator(handler));