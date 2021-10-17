import type { NextPage } from 'next';
import { useState } from 'react';
import { executeRequest } from '../services/api';
import { AccessTokenProps } from '../types/AccessTokenProps'; 

const Login: NextPage<AccessTokenProps> = ({setAccessToken}) => {
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msgErro, setMsgErro] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [isVisible, setVisible] = useState(false);
  const [isCreatingAccount, setCreatingAccount] = useState(false);

  const doLogin = async(e: any) => {
    try {
      setLoading(true);
      e.preventDefault();
      
      if(!login || !password) {
        setMsgErro('Parâmetros de entrada inválidos.');
        //setTimeout(() => {
          setLoading(false);
        //}, 1000);
        return;
      }

      const body = {
        login,
        password
      }

      const result = await executeRequest('login', 'POST', body);
      setMsgErro('');

      if(result && result.data) {
        localStorage.setItem('accessToken', result.data.token);
        localStorage.setItem('userName', result.data.name);
        localStorage.setItem('userEmail', result.data.email);
        setAccessToken(result.data.token);
      } else {
        setMsgErro('Não foi possível processar o login, tente novamente.');
      }
    } catch (er) {
      console.log(er);
      setMsgErro('Ocorreu um erro ao processar o login, tente novamente.');
    }
    setLoading(false);
  }

  const createAccount = async(e: any) => {   
    try {
      setLoading(true);
      e.preventDefault();

      if (!name || !email || !password) {
        setMsgErro('Parâmetros de entrada inválidos.');
        //setTimeout(() => {
          setLoading(false);
        //}, 1000);
        return;
      }

      const body = {
        name,
        email,
        password
      }

      const result = await executeRequest('user', 'POST', body);
      setMsgErro('');

      if (result && result.data) {
        setMsgErro('Conta criada, realize seu acesso!');
        setLogin(email);
        setPassword('');
        setMsgErro('');
        setCreatingAccount(false);
      } else {
        setMsgErro('Não foi possivel criar sua conta!');
      }
    } catch (er: any) {
      console.log(er);
      if (er?.response?.data?.error) {
        setMsgErro(er?.response?.data?.error);
      } else {
        setMsgErro('Ocorreu um erro ao criar conta, tente novamente.');
      }
    }
    setLoading(false);
  }

  const passwordVisible = () => {
    if(document.getElementById('password')?.getAttribute('type') === 'password' || 
        document.getElementById('new-password')?.getAttribute('type') === 'password') {
      document.getElementById('password')?.setAttribute('type', 'text');
      document.getElementById('new-password')?.setAttribute('type', 'text');
      setVisible(true);
    } else {
      document.getElementById('password')?.setAttribute('type', 'password');
      document.getElementById('new-password')?.setAttribute('type', 'password');
      setVisible(false);
    }
  }

  return (
    <div className="container-login">
      <img src="/logo.svg" alt="Logo FIAP" className="logo" />

      <form className={ isCreatingAccount ? "invisible" : "" }>
      { msgErro && <p>{msgErro}</p> }
        <div className="input">
          <img src="/mail.svg" alt="" />
          <input type="text" placeholder="Informe seu e-mail" 
            value={ login } onChange={ e => setLogin(e.target.value) }/>
        </div>
        <div className="input">
          <img src="/lock.svg" alt="" />
          <input type="password" id="password" placeholder="Informe sua senha"
            value={ password } onChange={ e => setPassword(e.target.value) } />
          <div onClick={ passwordVisible }>
            <img className={ isVisible ? "invisible" : "eye" } src="/closed-eye.svg" alt="" />
            <img className={ isVisible ? "eye" : "invisible" } src="/eye.svg" alt="" />
          </div>
        </div>
        <button className={ isLoading? "disabled" : "" } type="button" onClick={ doLogin } disabled={ isLoading }>
          { isLoading ? "... Carregando" : "Login" }
        </button>
        <a onClick={ () => {setCreatingAccount(true);setMsgErro("");setEmail(login);setPassword('')} }>Criar uma conta =)</a>
      </form>

      <form className={ isCreatingAccount ? "" : "invisible" }>
      { msgErro && <p>{msgErro}</p> }

        <div className="input">
          <img src="/user.svg" alt="" />
          <input type="text" placeholder="Informe seu nome" 
            value={ name } onChange={ e => setName(e.target.value) }/>
        </div>
        <div className="input">
          <img src="/mail.svg" alt="" />
          <input type="text" placeholder="Informe seu e-mail" 
            value={ email } onChange={ e => setEmail(e.target.value) }/>
        </div>
        <div className="input">
          <img src="/lock.svg" alt="" />
          <input type="password" id="new-password" placeholder="Crie uma senha"
            value={ password } onChange={ e => setPassword(e.target.value) } />
          <div onClick={ passwordVisible }>
            <img className={ isVisible ? "invisible" : "eye" } src="/closed-eye.svg" alt="" />
            <img className={ isVisible ? "eye" : "invisible" } src="/eye.svg" alt="" />
          </div>
        </div>
        <button className={ isLoading? "disabled" : "" } type="button" onClick={ createAccount } disabled={ isLoading }>
          { isLoading ? "... Carregando" : "Criar Conta" }
        </button>
        <a onClick={ () => {setCreatingAccount(false);setMsgErro('');setLogin(email);setPassword('')} }>Já possuo uma conta ; )</a>
      </form>
    </div>
  )
}

export { Login }