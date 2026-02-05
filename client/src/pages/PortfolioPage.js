import Portfolio from "../components/Portfolio";
import AllocationChart from "../components/AllocationChart";
import RiskMeter from "../components/RiskMeter";

const PortfolioPage = ({ wallet, prices }) => {
  if (!wallet) return null;

  return (
    <>
      <div className="card">
        <Portfolio holdings={wallet.holdings} prices={prices} />
      </div>

      <div className="card">
        <AllocationChart holdings={wallet.holdings} />
      </div>

      <div className="card">
        <RiskMeter holdings={wallet.holdings} />
      </div>
    </>
  );
};

export default PortfolioPage;
