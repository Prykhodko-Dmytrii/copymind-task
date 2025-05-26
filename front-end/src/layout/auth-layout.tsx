// File: src/components/AuthLayout.tsx
import React from 'react';
import {
    Flex,
    Container, Loader,
} from '@chakra-ui/react';
import {Outlet} from "react-router-dom";
import AppHeader from "../components/app-header/app-header.tsx";
import {useAuthStore} from "../store.ts";

interface AuthLayoutProps {
}

export const AuthLayout: React.FC<AuthLayoutProps> = () => {
    const {isLoadingAuth} = useAuthStore(state => state)
    return (
        <Flex direction="column" minH="100vh" bg={'gray.50'}>
            <AppHeader/>
            {isLoadingAuth ? <Loader/>  : <Flex flex="1" align="center" justify="center">
                <Container p={0} maxW="800px" boxShadow="md" borderRadius="md">
                      <Outlet/>
                </Container>
            </Flex>}
        </Flex>
    );
};
