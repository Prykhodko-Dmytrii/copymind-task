import React, {useEffect} from 'react';
import {Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import {useAuthStore, useSocketStore} from './store';
import LoginPage from "./pages/auth/login-page.tsx";
import RegisterPage from "./pages/auth/register-page.tsx";
import MainPage from "./pages/main/main-page.tsx";
import ConversationRoom from "./pages/main/conversation-room.tsx";
import {AuthLayout} from "./layout/auth-layout.tsx";
import {AuthClient} from "./api/auth-client.ts";
import MainLayout from "./layout/main-layout.tsx";
import {baseApiClient} from "./api";
import {jwtDecode} from "jwt-decode";


interface JWTPayload {
    exp: number;
}

const App: React.FC = () => {
    const {isAuthenticated, setAuth, getSystemUser} = useAuthStore(state => state);
    const connectSocket = useSocketStore((s) => s.connect);
    const socket = useSocketStore((s) => s.socket);
    const navigate = useNavigate();

    useEffect(() => {
        let storedToken = AuthClient.getAccessTokenFromStorage();
        if (!storedToken) {
            setAuth(false, false)
            navigate('/login')
        } else {
            try {
                const {exp} = jwtDecode<JWTPayload>(storedToken);
                if (Date.now() >= exp * 1000) {
                    (async () => {
                        const res = await baseApiClient<{ accessToken: string }>('/auth/token', 'POST');
                        if (res.data?.accessToken) {
                            storedToken = res.data.accessToken;
                            localStorage.setItem('accessToken', storedToken);
                            connectSocket(storedToken);
                            getSystemUser();
                        } else {
                            setAuth(false, false)
                            navigate('/login')
                            return;
                        }
                    })()
                } else {
                    getSystemUser();
                    connectSocket(storedToken);
                }
            } catch (err) {
                setAuth(false, false)
                navigate('/login')
                console.error(err)
            }
        }
    }, []);

    useEffect(()=>{
        let storedToken = AuthClient.getAccessTokenFromStorage();
        if(!socket && storedToken && isAuthenticated){
            connectSocket(storedToken);
        }
    },[isAuthenticated])


    if (!isAuthenticated) {
        return (
            <Routes>
                <Route element={<AuthLayout/>}>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>
                    <Route path="*" element={<Navigate to="/login"/>}/>
                </Route>
            </Routes>
        );
    }

    return (
        <Routes>
            <Route element={<MainLayout/>}>
                <Route path="/main" element={<MainPage/>}/>
                <Route path="/chat/:conversationId" element={<ConversationRoom/>}/>
                <Route path="*" element={<Navigate to="/main"/>}/>
            </Route>
        </Routes>
    );
};

export default App;
