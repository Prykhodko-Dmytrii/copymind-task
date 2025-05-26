import React from 'react';
import type {AiResponseDTO} from "../../types";
import {Timeline, Text, Badge, ListItem, List} from '@chakra-ui/react';

interface MessageResponsesHistory {
    responses: AiResponseDTO[]
}

const MessageResponsesHistory: React.FC<MessageResponsesHistory> = ({responses}) => {
    return (
        <Timeline.Root maxW="400px">
            {responses.map(el => <Timeline.Item>
                <Timeline.Connector>
                    <Timeline.Separator/>
                    <Timeline.Indicator>
                        <Text fontSize={'x-small'}>
                            V{el.version + 1}
                        </Text>
                    </Timeline.Indicator>
                </Timeline.Connector>
                <Timeline.Content>
                    <Timeline.Title>
                        <Badge colorPalette="green">{el.decisionCategory}</Badge>
                    </Timeline.Title>
                    <Timeline.Description>{new Date(el.createdDateTime).toLocaleDateString()}, {new Date(el.createdDateTime).toLocaleTimeString()}</Timeline.Description>
                    <Text fontWeight={'600'}>Cognitive biases:</Text>
                    <List.Root>
                        {el.cognitiveBiases.map(el => <List.Item textStyle="sm">{el}</List.Item>)}
                    </List.Root>
                    <Text fontWeight={'600'}>Missing alternatives:</Text>
                    <List.Root>
                        {el.missingAlternatives.map(el => <List.Item textStyle="sm">{el}</List.Item>)}
                    </List.Root>
                </Timeline.Content>
            </Timeline.Item>)}
        </Timeline.Root>
    );
};

export default MessageResponsesHistory;