import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menu = [
    { path: "", label: "Home" },          // default dashboard
    { path: "portfolio", label: "Portfolio" },
    { path: "analytics", label: "Analytics" },
    { path: "highlights", label: "Highlights" },
    { path: "strategy", label: "Strategies" },
    { path: "ai", label: "AI Insights" },
    { path: "history", label: "History" },
    ];


  return (
    <div className="sidebar">
      <h2 className="logo">📈 TraderPro</h2>

      {menu.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={
            location.pathname.endsWith(item.path) ? "nav-link active" : "nav-link"
            }
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
