import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const menu = [
  { path: "/dashboard",            label: "Home",        icon: "⊞" },
  { path: "/dashboard/portfolio",  label: "Portfolio",   icon: "◈" },
  { path: "/dashboard/analytics",  label: "Analytics",   icon: "↗" },
  { path: "/dashboard/highlights", label: "Highlights",  icon: "★" },
  { path: "/dashboard/strategy",   label: "Strategies",  icon: "◎" },
  { path: "/dashboard/ai",         label: "AI Insights", icon: "⬡" },
  { path: "/dashboard/history",    label: "History",     icon: "⟳" },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const isActive = (path) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard" || location.pathname === "/dashboard/"
      : location.pathname.startsWith(path);

  return (
    <>
      {/* Toggle button — always visible */}
      <button
        className={`sidebar-toggle ${collapsed ? "sidebar-toggle--out" : ""}`}
        onClick={onToggle}
        aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
        title={collapsed ? "Show sidebar" : "Hide sidebar"}
      >
        {collapsed ? (
          /* chevron right */
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          /* chevron left */
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">📈</div>
          {!collapsed && <span className="sidebar-brand-name">TraderPro</span>}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {!collapsed && <p className="sidebar-section-label">Menu</p>}
          {menu.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? "sidebar-link--active" : ""}`}
              title={collapsed ? item.label : ""}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {!collapsed && <span className="sidebar-link-label">{item.label}</span>}
              {!collapsed && isActive(item.path) && <span className="sidebar-link-bar" />}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="sidebar-logout"
            onClick={() => { logout(); navigate("/login"); }}
            title={collapsed ? "Logout" : ""}
          >
            <span>⎋</span>
            {!collapsed && " Logout"}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;