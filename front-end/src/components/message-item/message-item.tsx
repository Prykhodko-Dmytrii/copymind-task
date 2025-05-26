import React, {useEffect, useState} from 'react';
import {
    Box,
    Text,
    Badge,
    HStack,
    Button,
    Drawer,
    Portal,
    CloseButton,
    Loader,
    VStack,
    SkeletonCircle
} from '@chakra-ui/react';
import type {MessageDTO} from "../../types";
import {useMessageStore} from "../../store.ts";
import MessageResponsesHistory from "../mesage-repsonses-history/message-responses-history.tsx";

interface MessageItemProps {
    message: MessageDTO;
    onRetry: () => void;
    onRegenerate: () => void;
}

interface ShowVersionBarProps {
    messageId: string;
}

const ShowVersionBar: React.FC<ShowVersionBarProps> = ({messageId}) => {
    const {getActiveMessageHistory, activeMessageHistory} = useMessageStore(state => state)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (open) {
            getActiveMessageHistory(messageId)
        }
    }, [messageId, open]);

    return (
        <HStack wrap="wrap">
            <Drawer.Root open={open} onOpenChange={(e)=>setOpen(e.open)} size={'lg'}>
                <Drawer.Trigger asChild>
                    <Button borderRadius={'50'} variant="outline" size="sm">
                        History
                    </Button>
                </Drawer.Trigger>
                <Portal>
                    <Drawer.Backdrop/>
                    <Drawer.Positioner>
                        <Drawer.Content>
                            <Drawer.Header>
                                <Drawer.Title>History</Drawer.Title>
                            </Drawer.Header>
                            <Drawer.Body>
                                {activeMessageHistory?.isLoading ? <Loader/> :
                                    <MessageResponsesHistory responses={activeMessageHistory?.responses ?? []}/>}
                            </Drawer.Body>
                            <Drawer.CloseTrigger asChild>
                                <CloseButton size="sm"/>
                            </Drawer.CloseTrigger>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>

        </HStack>
    )
}

const AiMessageLoadingState = () => {
    return (<HStack>
        AI typing
        <SkeletonCircle size={1}/>
        <SkeletonCircle size={1}/>
        <SkeletonCircle size={1}/>
    </HStack>)
}

const MessageItem: React.FC<MessageItemProps> = ({message, onRetry, onRegenerate}) => {
    return (
        <Box
            p={4}
            bg={'white'}
            borderRadius="md"
            border="1px"
            borderColor="gray.200"
            w={'full'}
        >
            <VStack align={'flex-end'}>
                <Text fontSize={'x-small'}>{new Date(message.createdDateTime).toLocaleDateString()}, {new Date(message.createdDateTime).toLocaleTimeString()}</Text>
                <HStack justify="space-between">
                    <Badge
                        colorPalette={message.status === 'pending' ? 'yellow' : message.status === 'error' ? 'red' : 'green'}>
                        {message.status}
                    </Badge>
                    <Text fontWeight="bold">{message.description}</Text>
                </HStack>
                <Text mt={2}>{message.decision}</Text>
            </VStack>

            {message.status === 'pending' ? <AiMessageLoadingState/> : message.aiResponse && (
                <Box mt={3} p={2} bg="gray.100" borderRadius="sm">
                    <Text fontSize={'x-small'}>{new Date(message.aiResponse.createdDateTime).toLocaleDateString()}, {new Date(message.aiResponse.createdDateTime).toLocaleTimeString()}</Text>
                    <Text><strong>Category:</strong> {message.aiResponse.decisionCategory}</Text>
                    <Text><strong>Cognitive Biases:</strong> {message.aiResponse.cognitiveBiases.join(', ')}</Text>
                    <Text><strong>Alternatives:</strong> {message.aiResponse.missingAlternatives.join(', ')}</Text>
                </Box>
            )}

            <HStack spacing={2} mt={3}>
                {message.status === 'error' && (
                    <Button size="sm" onClick={onRetry}>Retry</Button>
                )}
                {message.aiResponse && (
                    <Button borderRadius={'50'} size="sm" variant="outline" onClick={onRegenerate}>Re-generate</Button>
                )}
                {(message?.aiResponse?.version ?? 0) >= 1 && (
                    <ShowVersionBar messageId={message.id}/>
                )}
            </HStack>
        </Box>
    );
};

export default MessageItem;