import React, {useEffect, useRef} from 'react';
import {useParams} from 'react-router-dom';
import {VStack, Spinner, Flex, Box} from '@chakra-ui/react';
import {useSocketStore} from "../../store.ts";
import {useMessageStore} from "../../store.ts";
import MessageItem from "../../components/message-item/message-item.tsx";
import MessageForm from "../../components/message-form/message-form.tsx";
import {EmptyState} from "../../components/ui/empty-state.tsx";
import {MdError} from "react-icons/md";

const ConversationRoom: React.FC = () => {
    const {conversationId} = useParams<{ conversationId: string }>();
    const socket = useSocketStore((s) => s.socket);
    const join = useSocketStore((s) => s.join);
    const leave = useSocketStore((s) => s.leave);
    const send = useSocketStore((s) => s.send);
    const retry = useSocketStore((s) => s.retry);
    const regenerate = useSocketStore((s) => s.regenerate);
    const {messages,errorLoadingMessages} = useMessageStore((s) => s);
    const getConversationMessages = useMessageStore((s) => s.getConversationMessages);

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (conversationId) {
            join(conversationId);
        }
        return () => {
            if (conversationId) {
                leave(conversationId);
            }
        }
    }, [conversationId, join]);

    useEffect(() => {
        if (!conversationId) return;
        (async () => {
            getConversationMessages(conversationId)
        })();
    }, [conversationId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const handleSend = (data: { description: string; decision: string; considerations: string[] }) => {
        if (conversationId) {
            send({conversationId, ...data});
        }
    };

    if (!socket) {
        return <Spinner size="xl"/>;
    }

    if(errorLoadingMessages){
        return <EmptyState title={errorLoadingMessages}
                           description={'Please select conversations from existing or create new'} icon={<MdError />}/>
    }

    if (!conversationId) {
        return <EmptyState title={'Conversation not found !'}
                           description={'Please select conversations from existing or create new'} icon={<MdError />}/>
    }

    return (
        <VStack px={20} position={'relative'} w={'full'} height={'calc(100vh - 100px)'} gap={4} align="stretch">
            <Flex w={'full'} overflow={'auto'} minH={'calc(100vh - 350px)'} flexDirection={'column'} gap={4}>
                {messages.length > 0 ? messages.map((m) => (
                    <MessageItem
                        key={m.id}
                        message={m}
                        onRetry={() => retry(conversationId!, m.id)}
                        onRegenerate={() => regenerate(conversationId!, m.id)}
                    />
                )) : <EmptyState title={'You don`t have any messages yet'} description={'Describe your situation and decision below, and I’ll do my best to help.'}/>}
                <div ref={chatEndRef} style={{minHeight: '1px'}}/>
            </Flex>
            <Box position={'sticky'} bottom={15} zIndex={2}>
                <MessageForm onSubmit={handleSend}/>
            </Box>
        </VStack>
    );
};

export default ConversationRoom;