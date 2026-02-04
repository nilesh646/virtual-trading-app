import Portfolio from "../components/Portfolio";
import PriceChart from "../components/PriceChart";
import PortfolioChart from "../components/PortfolioChart";
import AllocationChart from "../components/AllocationChart";
import RiskMeter from "../components/RiskMeter";

const PortfolioPage = ({ wallet, prices }) => (
  <>
    <div className="card">
      <Portfolio holdings={wallet.holdings} prices={prices} />
    </div>

    <div className="card"><PriceChart prices={prices} /></div>
    <div className="card"><PortfolioChart holdings={wallet.holdings} /></div>
    <div className="card"><AllocationChart holdings={wallet.holdings} /></div>
    <div className="card"><RiskMeter holdings={wallet.holdings} /></div>
  </>
);

export default PortfolioPage;
