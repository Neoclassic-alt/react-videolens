import './search.css'
import { Input, Layout, Button, Form, Typography } from 'antd';
import axios from 'axios';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { YOUR_SITE, YOUTUBE_KEY } from '../config'
import {AppstoreOutlined, UnorderedListOutlined, StarOutlined, StarFilled} from '@ant-design/icons'
import { ToastContainer, toast } from 'react-toastify';
import {v4 as uuidv4} from 'uuid'
import Menu from './../components/menu'

const { Header, Footer, Content } = Layout;
const {Text, Link} = Typography
const {Search: SearchInput} = Input

function Search(){
    const [autorized, setAutorized] = useState(false)
    const [searchResults, setSearchResults] = useState(null)
    const [viewMode, setViewMode] = useState("list") // список - list или карточки - card
    const [userID, setUserID] = useState(null)
    const [favorited, setFavorited] = useState(false)
    const [savedQueries, setSavedQueries] = useState(null)
    const [keyword, setKeyword] = useState("")
    const history = useHistory()
    const {param} = useParams()

    useEffect(() => {
        const token = localStorage.getItem('token')
        axios.get(YOUR_SITE + `users?token=${token}`).then(users => {
            const user = users.data
            if (user.length){
                setUserID(user[0].id)
                if (!user.length){
                    history.push('/login')
                } else {
                    setAutorized(true)
                    setSavedQueries(user[0].savedQueries)
                }
            } else {
                history.push('/login')
            }
        })
    }, [])
   
    useEffect(() => {
        if (param){
            const paramObject = param.split('=')
            if (paramObject[0] === "keyword"){
                const link = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${YOUTUBE_KEY}&q=${paramObject[1]}&maxResults=12`
                axios.get(link).then(({data}) => {
                    setSearchResults(data)
                })
                axios.get(YOUR_SITE + `users/${userID}`).then(({data}) => {
                    const contains = data.savedQueries.some(item => item.keyword === decodeURI(paramObject[1]))
                    setFavorited(contains)
                })
                setKeyword(decodeURI(paramObject[1]))
            }
            if (savedQueries && paramObject[0] === "savedQuery"){
                console.log(savedQueries)
                const q = savedQueries.find(item => item.queryID === paramObject[1])
                const link = "https://www.googleapis.com/youtube/v3/search?part=snippet" +
                `&key=${YOUTUBE_KEY}&q=${q.keyword}&maxResults=${q.maxResults}&order=${q.order}`
                console.log(link)
                axios.get(link).then(({data}) => {
                    setSearchResults(data)
                })
                setKeyword(q.keyword)
            }
        }
    }, [param, savedQueries])

    function onSearch(query){
        // если набран поисковый запрос, то кодируется при помощи keyword=ключ
        history.push('/results/keyword=' + encodeURI(query)) 
    }

    async function getUserData(){
        let userInfo = await axios.get(YOUR_SITE + `users/${userID}`)
        return userInfo.data
    }

    async function addToFavorites(){ // добавить в избранное
        let userInfo = await getUserData()
        userInfo.savedQueries.push({
            queryID: uuidv4(),
            keyword,
            name: '',
            maxResults: 12, // по умолчанию
            order: 'relevance' // 'date', 'rating', 'relevance', 'title', 'videoCount', 'viewCount'
        })
        await axios.put(YOUR_SITE + `users/${userID}`, userInfo)
        toast.info('Запрос добавлен в избранное. Перейдите в раздел, чтобы отредактировать его.')
        setFavorited(true)
    }

    async function deleteFromFavorites(){
        const uri = param.split('=')
        if (uri[0] === "keyword"){
            let userInfo = await axios.get(YOUR_SITE + `users/${userID}`)
            userInfo = userInfo.data
            userInfo.savedQueries = userInfo.savedQueries.filter(item => item.keyword !== decodeURI(uri[1]))
            await axios.put(YOUR_SITE + `users/${userID}`, userInfo)
            toast.info('Запрос удалён из избранного')
            setFavorited(false)
        }
    }

    function onChange({target: {value}}) {
        setKeyword(value)
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
                    defaultSelected="search"
                    actions={{
                        favorite: () => {history.push('/favorites')},
                        unlogin: () => {unlogin()}
                    }}
                />
            </Header>
                <Content>
                    <div className="content">
                        <div className="content__search">
                            <SearchInput 
                                placeholder="Что хотите посмотреть?" 
                                onSearch={onSearch} 
                                className="search__input"
                                enterButton="Найти"
                                size="large"
                                suffix={param && (favorited
                                    ? <StarFilled 
                                        style={{color: '#FFC61E'}}
                                        onClick={() => deleteFromFavorites()}
                                    />
                                    : <StarOutlined onClick={() => addToFavorites()} />)
                                }
                                value={keyword}
                                onChange={onChange}
                            />
                        </div>
                        {searchResults &&
                            <div className="results">
                                <div className="results__info">
                                    <Text className="results__count">Всего найдено видео: {searchResults.pageInfo.totalResults}</Text>
                                    <div className="results__views">
                                        <UnorderedListOutlined /* list */
                                            style={{color: viewMode === "card" ? '#a2a2a2' : 'black'}}
                                            onClick={() => setViewMode("list")}
                                        />
                                        <AppstoreOutlined /* card */
                                            style={{color: viewMode === "list" ? '#a2a2a2' : 'black', marginLeft: 10}}
                                            onClick={() => setViewMode("card")}
                                        />
                                    </div>
                                </div>
                                <div className="results__items" 
                                style={{justifyContent: viewMode === "card" ? 'center' : 'flex-start'}}>
                                    {searchResults.items.map(item => (
                                        <div 
                                            className={viewMode + " results__list"}
                                            key={item.id.videoId}
                                        >
                                            <div className={viewMode + "__image"}>
                                                <a href={"http://youtu.be/" + item.id.videoId}>
                                                    <img 
                                                        src={item.snippet.thumbnails.medium.url} 
                                                        alt={item.snippet.title} 
                                                        width={viewMode === "list" ? 320 : 180}
                                                    />
                                                </a>
                                            </div>
                                            <div className="list__text">
                                                <Link href={"http://youtu.be/" + item.id.videoId}>{item.snippet.title}</Link>
                                                <p>{item.snippet.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        }
                    </div>
                </Content>
            <Footer style={{ textAlign: 'center' }}>© Истигечев Борис, 2021</Footer>
            <ToastContainer />
        </Layout>
    )
    } else {return null}
}

export default Search