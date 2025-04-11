import openai from "openai";
import readlineSync from "readline-sync";
import colors from "colors";
import dotenv from "dotenv";

dotenv.config({
    path : "./.env"
})

const client = new openai({
    apiKey : process.env.OPENAI_SECRET_KEY
})


const chatbot = async () => {

    console.log(colors.bold.yellow("Welcome to Medichat!"));
    console.log(colors.bold.yellow("You can ask any question and enter exit to terminate"));

    const chatHistory = [];    

    while(true){
        const userInput = readlineSync.question(colors.magenta("You: "))

        try {

            const messages = chatHistory.map(([role, content]) => ({role, content}))

            messages.push({role : "user", content : userInput})

            const completion = await client.chat.completions.create({
                model : 'o3-mini',
                messages : messages
            })

            const completionText = completion.choices[0].message.content

            if(userInput.toLocaleUpperCase() === "exit"){
                console.log(colors.red("MediBot: ", completionText));
                return;
            }

            console.log(colors.green("Medibot: ", completionText));

            chatHistory.push(['user', userInput])
            chatHistory.push(['Medibot', completionText])

        } catch (error) {
            console.error("Error during chatbot setup.",error)
        }
    }
}

chatbot();


