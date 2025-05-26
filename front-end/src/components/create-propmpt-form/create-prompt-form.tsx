import React from 'react';
import {Button, Field, Flex, Input, Textarea} from "@chakra-ui/react";

interface CreatePromptFormProps {

}

const CreatePromptForm: React.FC<CreatePromptFormProps> = () => {

    return (
        <Flex w={'full'} px={4} py={2} borderRadius={'lg'} bg={'gray.100'} flexDirection="column" gap={'4'}>
            <Flex gap={2} align={'center'}>
            <Field.Root flex={1}>
                <Field.Label>Your Decision</Field.Label>
                <Input variant="flushed"/>
            </Field.Root>
                <Button>Send</Button>
            </Flex>
            <Flex flex={1} flexDirection="row" gap={'4'}>
                <Field.Root flex={1}>
                    <Field.Label>Situation Description</Field.Label>
                    <Textarea autoresize/>
                </Field.Root>
                <Field.Root flex={1}>
                    <Field.Label>Own Considerations</Field.Label>
                    <Textarea autoresize/>
                </Field.Root>
            </Flex>
        </Flex>
    );
};

export default CreatePromptForm;