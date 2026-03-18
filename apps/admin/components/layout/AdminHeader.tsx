export const AdminHeader = () => {

    return (
    <header className="admin-header d-flex align-items-center justify-content-end px-4">
        <div className="user-profile-wrapper">
            {/* Иконка пользователя */}
            <div className="rounded-circle border border-secondary"
                 style={{width: '35px', height: '35px', background: '#353E4B'}}>
            </div>
        </div>
    </header>
    )
}