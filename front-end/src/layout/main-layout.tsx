import {Center, Flex} from "@chakra-ui/react";
import {Outlet} from "react-router-dom";
import AppHeader from "../components/app-header/app-header.tsx";
import ConversationsLeftBar from "../components/conversations-left-bar/conversations-left-bar.tsx";

const MainLayout = () => {
    return (
        <Flex direction="column" w={'full'} minH="100vh" bg={'gray.50'}>
            <AppHeader/>
            <Flex mt={4} height={'calc(100vh - 100px)'} w='full'>
                <Flex flex={1}>
                <ConversationsLeftBar/>
                </Flex>
                <Center w={'full'} flex={4}>
                <Outlet/>
                </Center>
            </Flex>
        </Flex>
    );
};

export default MainLayout;