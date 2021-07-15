import { Menu } from 'antd';

function AppMenu({defaultSelected, actions}){
    return (
        <Menu 
            mode="horizontal"
            defaultSelectedKeys={[defaultSelected]}
            className="main-menu"
        >
            <Menu.Item 
                key="search"
                onClick={actions.search || null}
            >Поиск</Menu.Item>
            <Menu.Item 
                key="favorite"
                onClick={actions.favorite || null}
            >Избранное</Menu.Item>
            <Menu.Item 
                key="unlogin"
                onClick={actions.unlogin || null}
            >Выйти</Menu.Item>
        </Menu>
    )
}

export default AppMenu