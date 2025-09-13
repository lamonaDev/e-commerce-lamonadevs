"use client";
import { ProtectedRoute } from "@/_routes/route.route";
import { Suspense, useContext } from "react";
import { MainContext } from "@/app/_Context/MainContext";
export default function Home() { 
    const {userToken} = useContext(MainContext) as { userToken: string | null };
    return (
        <ProtectedRoute>
            <Suspense fallback={<><h1>loading</h1></>}>
                <section>
                <h1>Products Page - User Logged In</h1>
                    <small>{ userToken }</small>
                </section>
            </Suspense>
        </ProtectedRoute>
    );
}