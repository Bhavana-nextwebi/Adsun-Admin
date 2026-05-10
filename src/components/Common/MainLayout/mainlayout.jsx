import React from 'react'
import Header from './header';
import Footer from './footer';
import { Outlet } from 'react-router-dom';
import { Navbar } from './navbar';
import { SubElements } from './subElements';

export const MainLayout = () => {

    return (
        <>
   
        <Header />
            <Navbar/>
            <main>
                <Outlet />
            </main>
            <SubElements/>
            <Footer />
 
        </>
    )
}
