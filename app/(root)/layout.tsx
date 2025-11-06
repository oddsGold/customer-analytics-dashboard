import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "Next Pizza | Main page"
};

export default function HomeLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className='min-h-screen'>
            {/*<Suspense>*/}
            {/*    <Header />*/}
            {/*</Suspense>*/}
            {children}
        </main>
    );
}
