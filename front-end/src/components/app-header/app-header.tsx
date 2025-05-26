import {Button, CloseButton, Dialog, Flex, Heading, Portal} from "@chakra-ui/react";
import {ColorModeToggle} from "../ui/color-mode.tsx";
import {useAuthStore} from "../../store.ts";
import {RiLogoutBoxLine} from "react-icons/ri";
import {useState} from "react";


const LogOutBtn = ()=>{
    const {logout} = useAuthStore(state => state);
    const [open,setOpen] = useState(false);
    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
            <Dialog.Trigger asChild>
                <Button variant="outline"><RiLogoutBoxLine /></Button>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title> Logout Conformation</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            Are you sure you wish to Logout ?
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button onClick={logout}>Confirm</Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}


const AppHeader = () => {
    const {isAuthenticated} = useAuthStore(state => state)
    return (
        <Flex shadow={'md'} p={4} bg={'gray.100'} justify="space-between" alignItems="center">
            {isAuthenticated &&<LogOutBtn/>}
            <Heading color={'gray.700'}>
                ChatApp
            </Heading>
            {/*<ColorModeToggle/>*/}
        </Flex>
    );
};

export default AppHeader;