import React, {useState} from 'react';
import {Box, Input, Textarea, Button, VStack} from '@chakra-ui/react';
import {toaster} from "../ui/toaster.tsx";

interface MessageFormProps {
    onSubmit: (data: { description: string; decision: string; considerations: string[] }) => void;
}

const MessageForm: React.FC<MessageFormProps> = ({onSubmit}) => {
    const [description, setDescription] = useState('');
    const [decision, setDecision] = useState('');
    const [considerationsText, setConsiderationsText] = useState('');

    const handleSubmit: React.FormEventHandler = (e) => {
        e.preventDefault();
        if (description.trim() !== '' && decision.trim() !== '') {
            const considerations = considerationsText
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            onSubmit({description, decision, considerations});
            setDescription('');
            setDecision('');
            setConsiderationsText('');
        } else {
            toaster.create({
                title: 'Not valid input type',
                description: 'Description and decision fields are required !', type: 'error'
            })
        }
    };

    return (
        <Box borderRadius={'lg'} borderWidth={'1px'} borderStyle={'solid'} borderColor={'gray.200'} px={8} py={4}
             bg={'gray.100'} as="form" onSubmit={handleSubmit}>
            <VStack spacing={3} align="stretch">
                <Textarea
                    placeholder="Please provide description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    isRequired
                />
                <Input
                    placeholder="Please provide decision"
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    isRequired
                />
                <Input
                    placeholder="Considerations (comma separated)"
                    value={considerationsText}
                    onChange={(e) => setConsiderationsText(e.target.value)}
                />
                <Button type="submit" colorScheme="blue">
                    Submit
                </Button>
            </VStack>
        </Box>
    );
};

export default MessageForm;