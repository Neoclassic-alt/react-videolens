import './favorite.css'
import { Input, Layout, Button, Form, Typography, Modal, Select, Slider, InputNumber } from 'antd';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { YOUR_SITE, YOUTUBE_KEY } from '../config'
import {PlayCircleTwoTone, EditTwoTone, DeleteTwoTone} from '@ant-design/icons'
import Menu from './../components/menu'

const { Header, Footer, Content } = Layout;
const {Text, Title} = Typography
const { Option } = Select;

function Search(){
    const [autorized, setAutorized] = useState(false)
    const [userID, setUserID] = useState(null) // ID пользователя
    const [favoriteList, setFavoriteList] = useState() // список избранного
    const [isModalDeleteVisible, setModalDeleteVisible] = useState(false); // модальные окна
    const [isModalEditVisible, setModalEditVisible] = useState(false);
    const [currentQueryID, setCurrentQueryID] = useState() // ID текущей записи в избранном
    //const [queryInfo, setQueryInfo] = useState(null) // информация для записи в формы
    const [form] = Form.useForm()
    const history = useHistory()

    useEffect(() => {
        const token = localStorage.getItem('token')
        axios.get(YOUR_SITE + `users?token=${token}`).then(users => {
            const user = users.data
            if (!user.length){
                history.push('/login')
            } else {
                setAutorized(true)
                setUserID(user[0].id)
            }
        })
    }, [])

    useEffect(() => {
        if (userID) {
            axios.get(YOUR_SITE + `users/${userID}`).then(({data}) => {
                setFavoriteList(data.savedQueries)
            })
        }
    }, [userID])

    function showEditModal(queryID){
        setModalEditVisible(true)
        const queryInfo = favoriteList.find(favorite => favorite.queryID === queryID)
        form.setFieldsValue({
            keyword: queryInfo.keyword,
            name: queryInfo.name,
            order: queryInfo.order,
            maxResults: queryInfo.maxResults
        })
        //setFavoriteList(queryInfo)
        setCurrentQueryID(queryID)
    }

    async function getUserData(){
        let userInfo = await axios.get(YOUR_SITE + `users/${userID}`)
        return userInfo.data
    }

    async function saveFavorite({keyword, name, order, maxResults}){
        const index = favoriteList.findIndex(favorite => favorite.queryID === currentQueryID)
        const newFavoriteList = Object.values(Object.assign({}, favoriteList))
        newFavoriteList[index] = {
            queryID: currentQueryID,
            keyword,
            name,
            order,
            maxResults
        }
        setFavoriteList(newFavoriteList)
        let userInfo = await getUserData()
        userInfo.savedQueries = newFavoriteList
        setModalEditVisible(false)
        await axios.put(YOUR_SITE + `users/${userID}`, userInfo)
        setCurrentQueryID(null)
    }

    function showDeleteModal(queryID){
        setModalDeleteVisible(true)
        setCurrentQueryID(queryID)
    }

    async function deleteFavorite(){
        let newFavoriteList = favoriteList.filter(favorite => favorite.queryID !== currentQueryID)
        setFavoriteList(newFavoriteList)
        let userInfo = await getUserData()
        userInfo.savedQueries = newFavoriteList
        await axios.put(YOUR_SITE + `users/${userID}`, userInfo)
        setModalDeleteVisible(false)
        setCurrentQueryID(null)
    }

    async function unlogin(){
        localStorage.removeItem('token')
        let userInfo = await getUserData()
        userInfo.token = null
        await axios.put(YOUR_SITE + `users/${userID}`, userInfo)
        history.push('/login')
    }

    if (autorized){
    return (
        <Layout className="layout">
            <Header>
                <div className="logo" />
                <Menu 
                    defaultSelected="favorite"
                    actions={{
                        search: () => {history.push('/')},
                        unlogin: () => {unlogin()}
                    }}
                />
            </Header>
                <Content>
                    <div className="favorites-content">
                        <Title level={2} className="favorites-content__title">Ваши запросы:</Title>
                        {favoriteList?.length ? favoriteList.map(item => (
                            <div className="favorite favorites-content__top" key={item.queryID}>
                                <Text className="favorite__title" strong>{item.name || item.keyword}</Text>
                                <div className="favorite__buttons">
                                    <PlayCircleTwoTone 
                                        style={{fontSize: 24, marginRight: 10}} 
                                        twoToneColor="#52c41a"
                                        onClick={() => history.push(`results/savedQuery=${item.queryID}`)}
                                    />
                                    <EditTwoTone 
                                        style={{fontSize: 24, marginRight: 10}}
                                        onClick={() => showEditModal(item.queryID)}
                                    />
                                    <DeleteTwoTone 
                                        style={{fontSize: 24}} twoToneColor="red"
                                        onClick={() => showDeleteModal(item.queryID)}
                                    />
                                </div>
                            </div>
                        )) : <Text>В настоящее время нет сохранённых в избранном запросов.</Text>}
                    </div>
                    <Modal 
                        title="Удаление запроса" 
                        visible={isModalDeleteVisible}
                        onOk={deleteFavorite}
                        okType="danger"
                        onCancel={() => {setModalDeleteVisible(false)}}
                        cancelText="Отмена"
                    >
                        <p>Запрос будет удалён</p>
                    </Modal>
                    <Modal
                        title="Изменить запрос" 
                        visible={isModalEditVisible}
                        onOk={() => form.submit()}
                        onCancel={() => {
                            setModalEditVisible(false)
                        }}
                        okText="Сохранить"
                        cancelText="Закрыть"
                        className="edit-modal"
                    >
                        <Form
                            name="editQuery"
                            layout="vertical"
                            onFinish={saveFavorite}
                            form={form}
                        >
                            <Form.Item
                                label="Запрос"
                                name="keyword"
                                rules={[
                                {
                                    required: true,
                                    message: 'Поле не должно быть пустым',
                                },
                                ]
                            }
                            >
                                <Input
                                    placeholder="Укажите запрос"
                                />
                            </Form.Item>
                            <Form.Item
                                label="Название"
                                name="name"
                            >
                                <Input 
                                    placeholder="Укажите название"
                                />
                            </Form.Item>
                            <Form.Item
                                label="Сортировка"
                                name="order"
                            >
                                <Select>
                                    <Option value="date">По дате</Option>
                                    <Option value="rating">По рейтингу</Option>
                                    <Option value="relevance">По релевантности</Option>
                                    <Option value="title">По названию</Option>
                                    <Option value="videoCount">По количеству видео на канале</Option>
                                    <Option value="viewCount">По количеству просмотров</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Максимальное количество видео в поиске (максимум 50)"
                                name="maxResults"
                            >
                                <Slider
                                    max={50}
                                />
                            </Form.Item>
                            <Form.Item
                                name="maxResults"
                                wrapperCol={{span: 7}}
                            >
                                <InputNumber />
                            </Form.Item>
                        </Form>
                    </Modal>
                </Content>
            <Footer style={{ textAlign: 'center' }}>© Истигечев Борис, 2021</Footer>
        </Layout>
    )
    } else {return null}
}

export default Search