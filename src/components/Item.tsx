interface ItemProps {
    url: string;
    operator: string;
}

export const Item = ({ url, operator }:ItemProps) => {
    return (
        <a href={url} className="w-48 h-48 text-center rounded border-4 border-white flex items-center justify-center text-white hover:bg-blue-500 text-7xl cursor-pointer font-bold transition-colors">
            {operator}
        </a>
    )
}