import {EmptyState} from "../../components/ui/empty-state.tsx";
import {useAuthStore, useConversationStore} from "../../store.ts";
import {Center, Flex} from "@chakra-ui/react";
import {IoMdChatbubbles} from "react-icons/io";
import {ConversationsList} from "../../components/conversations-left-bar/conversations-left-bar.tsx";

const MainPage = () => {
    const {userName} = useAuthStore(state => state)
    const {conversations, isLoadingConversations} = useConversationStore(state => state)
    return (
        <Flex p={4} flexDirection={'column'} align={'center'} h={'full'} w={'full'}>
            <EmptyState title={`Hey ${userName}, glad to see you !`}
                        description={'Select an existing conversation or start a new one to begin.'} icon={<IoMdChatbubbles/>}/>
            <Center minW={200} maxW={500}>
                <ConversationsList isLoading={isLoadingConversations} conversations={conversations}/>
            </Center>
        </Flex>
    );
};

export default MainPage;