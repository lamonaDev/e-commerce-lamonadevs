import {BarLoader, BeatLoader} from 'react-spinners'
import FadeContent from '../../_Animations/FadeContent'
export default function LoaderPage({typeOfLoader = "Loading"}) {
    return (
        <FadeContent blur={true} duration={300} easing="ease-out" initialOpacity={0}>
            <section className="bg-black h-screen w-full flex justify-center flex-col items-center fixed inset-0">
                <div className="flex flex-row items-baseline gap-3 sm:gap-4">
                    <h1 className="text-xl sm:text-2xl md:text-3xl text-blue-100 mb-6 sm:mb-8">{typeOfLoader}</h1>
                    <BeatLoader color="lightblue" size={12} />
                </div>
                <BarLoader color="lightblue" speedMultiplier={2} width="14%" cssOverride={{ width: 'min(200px, 90%)' }} />
            </section>
        </FadeContent>
    )
}