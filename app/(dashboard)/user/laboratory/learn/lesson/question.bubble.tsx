import Image from "next/image";


type Props = {
    question:string;
};


export const QuestionBubble = ({question}:Props) => {
    return(
        <div className="flex items-center gap-x-2 sm:gap-x-4 mb-4 sm:mb-6">
            <Image
            src="/mascot.jpg"
            alt="Mascot"
            height={60}
            width={60}
            className="hidden lg:block rounded-full"
            
            />
            <Image
            src="/mascot.jpg"
            alt="Mascot"
            height={32}
            width={32}
            className="block sm:hidden rounded-full"
            
            />
            <Image
            src="/mascot.jpg"
            alt="Mascot"
            height={40}
            width={40}
            className="hidden sm:block lg:hidden rounded-full"
            
            />
            <div className="relative py-3 sm:py-4 px-3 sm:px-4 border-2 border-violet-800 rounded-xl text-xs sm:text-sm lg:text-base text-white leading-relaxed flex-1">{question}

                <div className="absolute -left-2 sm:-left-3 top-1/2 w-0 h-0 border-x-4 sm:border-x-8 border-x-transparent border-t-4 sm:border-t-8 border-violet-800 transform -translate-y-1/2 rotate-90"/>
            </div>
        </div>
    )
}