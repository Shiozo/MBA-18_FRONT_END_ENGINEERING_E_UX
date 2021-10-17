import type {NextApiRequest, NextApiResponse} from 'next';
import { DefaultResponseMsg } from '../../types/DefaultResponseMsg';
import { User } from '../../types/User';
import { UserModel } from '../../models/UserModel';
import connectDB from '../../middlewares/connectDB';
import md5 from 'md5';

const handler = async (req: NextApiRequest, res: NextApiResponse<DefaultResponseMsg>) => {
    try {
        if(req.method !== 'POST'){
            res.status(400).json({ error: 'Método solicitado não existe.' });
            return;
        }

        if(req.body){
            const user = req.body as User;
            if(!user.name || user.name.length < 3){
                res.status(400).json({ error: 'Nome do usuário inválido.' });
                return;
            }

            if(!user.email || !user.email.includes('@') || !user.email.includes('.') || user.email.length < 4){
                res.status(400).json({ error: 'E-mail do usuário inválido.' });
                return;
            }

            var strongRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})');
            if(!user.password || user.password.length < 4 || !strongRegex.test(user.password)){
                res.status(400).json({ error: 'Senha de usuário inválida.' });
                return;
            }
            
            const existingUser = await UserModel.find({ email : user.email });
            if(existingUser && existingUser.length > 0){
                res.status(400).json({ error: 'Já existe usuário com o e-mail informado.' });
                return;
            }

            const final = {
                ...user,
                password : md5(user.password)
            }

            await UserModel.create(final);
            res.status(200).json({ msg: 'Usuário adicionado com sucesso!' });
            return;
        }

        res.status(400).json({ error: 'Parâmentros de entrada inválidos.' });
    } catch (e) {
        console.log('Ocorreu erro ao criar usuário: ', e);
        res.status(500).json({ error: 'Ocorreu erro ao criar usuário, tente novamente.' });
    }
}

export default connectDB(handler);