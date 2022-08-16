import { Item } from "../components/Item"

const list = [
  {url: "/operator/add", operator: "+"},
  {url: "/operator/sub", operator: "-"},
  {url: "/operator/mult", operator: "x"},
  {url: "/operator/div", operator: "/"},
]

export const Home = () => {
    return (
        <>
            <div className="flex flex-wrap max-w-lg items-center justify-center mx-auto gap-3">
                {
                list.map((item) => {
                    return (
                    <Item key={item.operator} url={item.url} operator={item.operator} />
                    )
                })
                }
            </div>
        </>
    )
}
