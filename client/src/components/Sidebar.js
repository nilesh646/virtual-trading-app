import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menu = [
    { path: "/dashboard", label: "Home" },
    { path: "/dashboard/portfolio", label: "Portfolio" },
    { path: "/dashboard/analytics", label: "Analytics" },
    { path: "/dashboard/highlights", label: "Highlights" },
    { path: "/dashboard/strategy", label: "Strategies" },
    { path: "/dashboard/ai", label: "AI Insights" },
    { path: "/dashboard/history", label: "History" },
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
