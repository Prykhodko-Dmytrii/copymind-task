import {z} from 'zod'
import {Box, Button, Field, Flex, Stack, Link as ChakraLink, Input} from "@chakra-ui/react";
import {PasswordInput} from "../../components/ui/password-input.tsx";
import {Link, useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {AuthClient} from "../../api/auth-client.ts";
import {toaster} from "../../components/ui/toaster.tsx";

export const registerSchema = z
    .object({
        userName: z.string().min(1, { message: 'User name is required' }),
        email: z.string().email({ message: 'Invalid email address' }),
        password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
        repeatPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    })
    .refine((data) => data.password === data.repeatPassword, {
        path: ['repeatPassword'],
        message: 'Passwords do not match',
    })
type RegisterFormValues = z.infer<typeof registerSchema>

const RegisterPage = () => {

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = async (data: RegisterFormValues) => {
       const res = await AuthClient.register({password:data.password, email:data.email, userName:data.userName});
       if(res.data && !res.error){
           toaster.create({ title: 'Успіх!', description: 'Реєстрація пройшла успішно.', type:'success' });
           navigate('/login');
       }else{
           toaster.create({ title: 'Cталася помилка', description: res.error?.message ?? 'OOups...', type:'error' });
       }
    }


    return (
        <Flex flexDirection={'column'} p={'4'} align={'center'} w="full" >
            <Box fontSize={'x-large'}>Create an Account</Box>
            <form style={{width:'100%'}} onSubmit={handleSubmit(onSubmit)}>
                <Stack w={'full'} gap="4" align="flex-start" >
                    <Field.Root required invalid={Boolean(errors.userName?.message)}>
                        <Field.Label>
                            User Name <Field.RequiredIndicator/>
                        </Field.Label>
                        <Input {...register('userName')} placeholder="Please enter your User Name ..." variant="outline"/>
                        <Field.ErrorText>{errors.userName?.message}</Field.ErrorText>
                    </Field.Root>
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
                    <Field.Root required invalid={Boolean(errors.repeatPassword?.message)}>
                        <Field.Label>
                            Repeat Password <Field.RequiredIndicator/>
                        </Field.Label>
                        <PasswordInput {...register('repeatPassword')} placeholder="Please repeat your password here..."
                                       variant="outline" type="password"/>
                        <Field.ErrorText>{errors.repeatPassword?.message}</Field.ErrorText>
                    </Field.Root>
                    <Button disabled={isSubmitting} w='full' type="submit">Submit</Button>
                </Stack>
            </form>
            <Box mt={4}>
              Already have an account? <ChakraLink asChild color={'green.600'}><Link to={'/login'}>Log In</Link></ChakraLink>
            </Box>
        </Flex>
    );
};

export default RegisterPage;