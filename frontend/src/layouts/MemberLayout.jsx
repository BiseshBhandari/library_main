import React from "react";
import { Outlet } from "react-router-dom";
import MemberSide from "../Components/Navigation/MemberSide";
import "../styles/MemberLayout.css";

function MemberLayout() {
    return (
        <div className="member-layout">
            <div className="MemberNav">
                <MemberSide />
            </div>
            <main className="member-content">
                <Outlet />
            </main>
        </div>
    );
}

export default MemberLayout;