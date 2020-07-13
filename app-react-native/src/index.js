import React, { useState, useEffect, useRef } from 'react';
import {
    // Views
    SafeAreaView,
    FlatList,
    // Elements
    Text,
    TextInput,
    TouchableOpacity,
    // General
    StyleSheet,
    StatusBar,
    View,
} from 'react-native';

import io from "socket.io-client";
const socket = io("http://10.0.2.2:3000");
let lastAuthor = '';

export default function App() {
    const flatListRef = useRef(); // Necessária para criação de referências

    // [Var, metodo de modificação] = definição da variável
    const [author, setAuthor] = useState('mobile');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    // UseEffect trabalha como "efeito colateral", pode ser usado como um watcher
    useEffect(() => {
        socket.on("previousMessages", messages => {
            console.log('== connected ==');

            for (const message of messages) {
                renderMessage(message);
            }
        });
        socket.on("receivedMessage", message => {
            renderMessage(message);
        });
    }, ['dep']); //Sem o array de dep, o useEffect fica em loop

    function renderMessage(message) {
        setMessages(prevMsg => [...prevMsg, message]);
    }

    function sendMessage(e) {
        e.preventDefault;
        if (author && message) {
            const objMessage = {
                author: author,
                message: message
            };
            socket.emit("sendMessage", objMessage);
            renderMessage(objMessage);
            setMessage('');
        }
    }

    async function isSameAuthor(thisAuthor) {
        if (lastAuthor == '') {
            lastAuthor = thisAuthor;
            return false;
        } else {
            if (lastAuthor == thisAuthor) {
                console.log('== equal');
                return true;
            } else {
                lastAuthor = thisAuthor;
                return false;
            }
        }
    }

    return (
        // Como tudo precisa estar dentro de uma tag, é possível usar o <> que não altera na renderização
        <>
            <StatusBar barStyle="light-content" backgroundColor="#7159c1" />

            {/* SafeArea impede que a tela invada "recuos" da tela infinita e barra de status */}
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Chat App</Text>
                </View>

                {/* 
                 * FlatList renderiza apenas os itens em tela, não os que ainda estão fora dela,
                 * melhorando a performance. Ele já cria a função de um for.
                 */}
                <FlatList style={styles.messages}
                    // Cria a referencia pra se direcionar funções (como a scrollToEnd)
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(message, index) => index + '.' + message.author}
                    // Cria o scroll automatico
                    onContentSizeChange={() => flatListRef.current.scrollToEnd()}
                    renderItem={({ item }) => (
                        <View style={item.author == author ? styles.myMessage : styles.message}>
                            <Text style={item.author == author ? styles.none : styles.author}>
                                {item.author}:
                            </Text>
                            <Text style={item.author == author ? styles.myText : styles.text}>
                                {item.message}
                            </Text>
                        </View>
                    )}
                >
                </FlatList>

                <View style={styles.footer}>
                    <TextInput
                        placeholder="Tip a message..."
                        style={styles.input}
                        onChangeText={(text) => setMessage(text)}
                        value={message}
                    ></TextInput>

                    {/* Botão que cria efeito de opacidade ao clique para interagir com o usuário */}
                    <TouchableOpacity style={styles.button} onPress={sendMessage}>
                        <Text style={styles.buttonText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    )
}

// o "CSS" trabalha como objeto, RN possui seus proprios atributos
const styles = StyleSheet.create({
    none: {
        display: 'none',
    },
    title: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#7159c1',
    },
    header: {
        paddingTop: 8,
        paddingBottom: 12,
    },
    messages: {
        width: '100%',
        paddingHorizontal: 18,
    },
    message: {
        alignItems: 'flex-start',
        marginBottom: 5
    },
    myMessage: {
        alignItems: 'flex-end',
        marginBottom: 5
    },
    author: {
        color: '#4e3894',
    },
    text: {
        backgroundColor: '#4e3894',
        color: '#FFF',
        borderRadius: 5,
        paddingVertical: 12,
        paddingHorizontal: 18,
        maxWidth: '90%',
        borderTopLeftRadius: 0,
    },
    myText: {
        backgroundColor: '#FFF',
        color: '#4e3894',
        borderRadius: 5,
        paddingVertical: 12,
        paddingHorizontal: 18,
        maxWidth: '90%',
        borderTopRightRadius: 0,
    },
    footer: {
        backgroundColor: '#806ac8',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    input: {
        color: 'white',
        flexGrow: 1,
        paddingHorizontal: 15
    },
    button: {
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10
    },
    buttonText: {
        color: '#4e3894',
    }
});