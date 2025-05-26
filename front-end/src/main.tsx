
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';
import {system} from "./theme.ts";
import {ColorModeProvider} from "./components/ui/color-mode.tsx";
import {Toaster} from "./components/ui/toaster.tsx";


ReactDOM.createRoot(document.getElementById('root')!).render(
        <ChakraProvider value={system}>
            <ColorModeProvider>
            <BrowserRouter>
                <App />
                <Toaster/>
            </BrowserRouter>
            </ColorModeProvider>
        </ChakraProvider>
);