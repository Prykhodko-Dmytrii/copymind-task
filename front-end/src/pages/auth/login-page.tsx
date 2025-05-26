import {Box, Button, Field, Flex, Input, Stack, Link as ChakraLink} from "@chakra-ui/react";
import {useForm} from "react-hook-form"
import {z} from 'zod'
import {zodResolver} from "@hookform/resolvers/zod";
import {PasswordInput} from "../../components/ui/password-input.tsx";
import {Link} from "react-router-dom";
import {useAuthStore} from "../../store.ts";

const loginSchema = z.object({
    email: z.string().email({message: 'Invalid email address'}),
    password: z.string().min(6, {message: 'Password must be at least 6 characters'}),
})

type LoginFormValues = z.infer<typeof loginSchema>


const LoginPage = () => {
    const {login} = useAuthStore(state => state)
    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormValues) => {
        login(data)
    }

    return (
        <Flex flexDirection={'column'} p={'4'} align={'center'} w="full">
            <Box fontSize={'x-large'}>Welcome Back</Box>
            <form  style={{width:'100%'}}  onSubmit={handleSubmit(onSubmit)}>
                <Stack w={'full'} gap="4" align="flex-start">
                    <Field.Root required invalid={Boolean(errors.email?.message)}>
                        <Field.Label>
                            Email <Field.RequiredIndicator/>
                        </Field.Label>
                        <Input {...register('email')} placeholder="me@example.com" variant="outline"/>
                        <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root required invalid={Boolean(errors.password?.message)}>
                        <Field.Label>
                            Password <Field.RequiredIndicator/>
                        </Field.Label>
                        <PasswordInput {...register('password')} placeholder="Enter your password here..."
                                       variant="outline" type="password"/>
                        <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                    </Field.Root>
                    <Button w='full' type="submit">Submit</Button>
                </Stack>
            </form>
            <Box mt={4}>
                Don't have an account? <ChakraLink asChild color={'green.600'}><Link to={'/register'}>Sign
                Up</Link></ChakraLink>
            </Box>
        </Flex>
    );
};

export default LoginPage;