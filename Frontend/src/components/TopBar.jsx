function TopBar({ setPage }) {
    return (
        <div style={{
            display: "flex",
            justifyContent: "flex-end",

        }}>
            <button onClick={() => setPage("about")} style={{ marginRight: 10 }}>
                About
            </button>
            <button onClick={() => setPage("contact")}>
                Contact
            </button>
        </div>
    );
}

export default TopBar;
