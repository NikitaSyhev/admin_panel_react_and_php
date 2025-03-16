import React, {Component} from 'react';

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pass: ""
        }
    }

    //метод обработки изменения пароля
    onPasswordChange(e) {
        this.setState({
            pass: e.target.value
        })
    }

    render() {
        const {pass} = this.state;
        const {login, lengthErr, logErr} = this.props;

        let renderLogErr, renderLengthErr;

        logErr ? renderLogErr = <span style={{ display: 'block', color: 'red', marginTop: '10px' }} className="login-error">Введен неправильный пароль!</span> : null;
        lengthErr ? renderLengthErr = <span style={{ display: 'block', color: 'red', marginTop: '10px' }} className="login-error">Пароль должен быть длиннее 5 символов</span> : null;

        return (
            <div style={{
                position: 'absolute',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                top: 0,
                left: 0,
                width: '100%',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 2
            }}>
                <div style={{
                    width: '600px',
                    padding: '30px',
                    backgroundColor: '#fff',
                    borderRadius: '4px'
                }}>
                    <h2 className="uk-modal-title uk-text-center">Авторизация</h2>
                    <div className="uk-margin-top uk-text-lead">Пароль:</div>
                    <input 
                        type="password" 
                        name="" 
                        id="" 
                        className="uk-input uk-margin-top"
                        placeholder="Пароль"
                        value={pass}
                        onChange={(e) => this.onPasswordChange(e)}
                    />
                    {renderLogErr}
                    {renderLengthErr}
                    <button 
                        className="uk-button uk-button-primary uk-margin-top" 
                        type="button"
                        onClick={() => login(pass)}
                    >
                        Вход
                    </button>
                </div>
            </div>
        );
    }
}