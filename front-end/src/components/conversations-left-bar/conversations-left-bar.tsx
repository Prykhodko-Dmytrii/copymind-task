import {useConversationStore} from "../../store.ts";
import {
    Button,
    Field,
    Flex,
    Input,
    InputGroup,
    Loader,
    Popover,
    Portal,
    Skeleton,
    Stack,
    Text,
    Link as ChakraLink, Box,
} from "@chakra-ui/react";
import React, {Fragment, useEffect, useMemo, useState} from "react";
import {LuSearch} from "react-icons/lu";
import {IoCloseSharp} from "react-icons/io5";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toaster} from "../ui/toaster.tsx";
import {Link, useLocation, useNavigate} from 'react-router-dom'
import type {ConversationDTO} from "../../types";

const createConversationSchema = z.object({
    title: z.string().nonempty('This field can`t be empty')
})

type CreateConversationFormValues = z.infer<typeof createConversationSchema>

export const AddNewConversation = () => {
    const {createConversation, isPendingCreateConversation} = useConversationStore(state => state)
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting}, reset
    } = useForm<CreateConversationFormValues>({
        resolver: zodResolver(createConversationSchema),
    });

    const onSubmit = async (data: CreateConversationFormValues) => {
        const res = await createConversation(data)
        if (res) {
            reset();
            setOpen(false);
            toaster.create({title: "Conversation successfully created !", type: 'success'});
            navigate(`/chat/${res}`);
        }
    }

    return (
        <Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
            <Popover.Trigger>
                <Button disabled={isPendingCreateConversation} size="sm" variant="outline">
                    {isPendingCreateConversation ? <Loader/> : "Add"}
                </Button>
            </Popover.Trigger>
            <Portal>
                <Popover.Positioner>
                    <Popover.Content>
                        <Popover.Arrow/>
                        <Popover.Body>
                            <Stack gap="4">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <Field.Root>
                                        <Field.Label>Conversation Name</Field.Label>
                                        <Input {...register('title')}
                                               placeholder="Enter conversation name..."/>
                                        <Field.ErrorText>{errors.title?.message}</Field.ErrorText>
                                    </Field.Root>
                                </form>
                            </Stack>
                        </Popover.Body>
                        <Popover.CloseTrigger/>
                    </Popover.Content>
                </Popover.Positioner>
            </Portal>
        </Popover.Root>
    )
}

interface ConversationsListProps {
    conversations: ConversationDTO[],
    pathname?: string;
    isLoading: boolean
}

export const ConversationsList: React.FC<ConversationsListProps> = ({conversations, isLoading, pathname = ''}) => {
    return (<Flex w={'full'} flexDirection={'column'} gap={'2'} mt={2}>
        <Flex align={'center'} justify={'space-between'}>
            <Box>Conversations:</Box> <AddNewConversation/>
        </Flex>
        {isLoading && <Fragment>
            <Skeleton flex="1" height="5" variant="pulse"/>
            <Skeleton flex="1" height="5" variant="pulse"/>
            <Skeleton flex="1" height="5" variant="pulse"/>
        </Fragment>
        }
        {conversations.length === 0 && <Text>There are no conversations</Text>}
        {conversations.map(el => <ChakraLink variant={'plain'} asChild fontWeight={'500'} py={1} px={2}
                                             overflow={'hidden'}
                                             borderRadius={'md'}
                                             bg={pathname === `/chat/${el.id}` ? 'gray.200' : 'transparent'}
                                             _hover={{bg: 'gray.200', cursor: 'pointer'}}><Link
            to={`/chat/${el.id}`}>{el.title}</Link></ChakraLink>)}
    </Flex>)
}

const ConversationsLeftBar = () => {
    const {getConversations, conversations, isLoadingConversations} = useConversationStore(state => state)
    const [search, setSearch] = useState("");
    const {pathname} = useLocation()

    useEffect(() => {
        getConversations();
    }, []);

    const filteredConversations = useMemo(() => {
        if (search.trim() !== '') {
            return conversations.filter(el => el.title.trim().toLowerCase().indexOf(search.trim().toLowerCase()) !== -1);
        }
        return conversations;
    }, [search, conversations])

    return (<Flex flexDirection={'column'} h={'full'} borderRight={'2px'} borderStyle={'solid'} borderColor={'gray.200'}
                  p={4}>
        <Flex gap={2} align={'center'}>
            <InputGroup startElement={<LuSearch/>} endElement={<IoCloseSharp onClick={() => setSearch('')}/>}>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."/>
            </InputGroup>
        </Flex>
        <ConversationsList isLoading={isLoadingConversations} conversations={filteredConversations}
                           pathname={pathname}/>
    </Flex>)


};

export default ConversationsLeftBar;