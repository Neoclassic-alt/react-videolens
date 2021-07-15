import './login.css'
import { Form, Input, Button, Typography } from 'antd';
import Layout from 'antd/lib/layout/layout';
import axios from 'axios';
import {v4 as uuidv4} from 'uuid'
import { useHistory } from 'react-router';
import { useState } from 'react';
import { YOUR_SITE } from '../config';

const {Text, Link} = Typography

function Login(){
    let history = useHistory()
    let [error, setError] = useState(false)

    async function onFinish({username, password}){
        let user = await axios.get(`${YOUR_SITE}users?e-mail=${username}&${password}`)
        user = user.data[0]
        if(user){
            const key = uuidv4()
            user.token = key
            axios.put(`${YOUR_SITE}users/${user.id}`, user)
            localStorage.setItem('token', key)
            history.push('/')
        } else {
            setError(true)
        }
    }

    function onFinishFailed(errorInfo){
        console.log('Ошибка: ', errorInfo)
    }

    return (
        <Layout className="container">
            <Layout className="login">
                <Text strong>Вход</Text>
                <Form
                    name="login"
                    labelCol={{
                        span: 8,
                    }}
                    wrapperCol={{
                        span: 24,
                    }}
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    {error && <Text type="danger">Логин или пароль неверны.</Text>}
                    <Form.Item
                        label="Логин"
                        name="username"
                        rules={[
                        {
                            required: true,
                            message: 'Поле не должно быть пустым',
                        },
                        ]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label="Пароль"
                        name="password"
                        rules={[
                        {
                            required: true,
                            message: 'Поле не должно быть пустым',
                        },
                        ]}
                    >
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item 
                        wrapperCol={{ offset: 8, span: 20 }}
                    >
                        <Button type="primary" htmlType="submit">
                        Войти
                        </Button>
                    </Form.Item>
                </Form>
            </Layout>
        </Layout>
    )
}

export default Login;