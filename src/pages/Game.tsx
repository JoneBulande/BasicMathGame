import { FormEvent, useRef, useState } from "react"
import { useParams } from "react-router"

export const Game = () => {
    const { operator } = useParams<{ operator: string }>()

    const inputAnswer = useRef<HTMLInputElement>(null)

    const operators = {
        "add": "+",
        "sub": "-",
        "mult": "x",
        "div": "/"
    }

    const [ number1, setNumber1 ] = useState(Math.floor((Math.random() * 12)))
    const [ number2, setNumber2 ] = useState(Math.floor((Math.random() * 12)))
    
    const validate = (event:FormEvent) => {
        event.preventDefault()

        const expression = number1 + operators[operator] + number2
        const result = eval(expression.replace("x", "*"))

        console.log(Number(inputAnswer.current?.value), Number(result))
        try {
            if (Number(inputAnswer.current?.value) === Number(result)) {
                alert("Acertou")
            } else {
                alert("Errou")
            }
        } catch(error) {
            alert("Valor invalido")
        }
        
        inputAnswer.current?.focus()
        setNumber1(Math.floor((Math.random() * 12)))
        setNumber2(Math.floor((Math.random() * 12)))
    }

    return (
        <form 
        className="flex flex-col gap-5 max-w-lg items-center justify-center mx-auto text-7xl text-white"
        onSubmit={ validate }>
            <div className="flex gap-2 items-center">
                <p>{ number1 }</p>
                <span>{ operators[operator] }</span>
                <p>{ number2 }</p>
                <input type="text" className="bg-transparent w-48 outline-none border-b border-white" ref={inputAnswer} />
            </div>

            <button 
            className="text-xl bg-white rounded-lg py-2 px-5 text-black">
            Validar</button>
        </form>
    )
}