import axios, { Method } from 'axios';

export const executeRequest = (endpoint: string, method: Method, body?: any) => {
	const headers = { 'Content-Type': 'application/json' } as any;

	const accessToken = localStorage.getItem('accessToken');
	if (accessToken) {
		headers['Authorization'] = 'Bearer ' + accessToken;
	}

	/*
	if(!process.env.FRONTEND_API_URL) {
		throw new Error('ENV API URL não encontrada.');
	}
	*/

	const URL = 'http://localhost:3000/api/' + endpoint;
	console.log(`executando: ${URL}, metodo: ${method}, body: ${body}
        , headers: ${headers}`);
	return axios.request({
		url: URL,
		method: method,
		data: body ? body : '',
		headers: headers,
		timeout: 30000
	});
}