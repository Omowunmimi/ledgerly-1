import { Canvas, Storyboard } from "tempo-sdk/canvas";
import MarketingSite from "../../../../src/components/marketing";
import {
  CreateInvoiceScreen,
  DashboardScreen,
  InvoiceListScreen,
} from "../../../../src/components/application";

export default function LedgerlyProductCanvas() {
  return (
    <Canvas name="Ledgerly · Product & Application">
      <Storyboard
        id="Marketing Desktop"
        name="Marketing · Desktop · Full page"
        component={MarketingSite}
        layout={{ x: 0, y: 0, width: 1440, height: 9039.4296875 }}
      />
      <Storyboard
        id="Marketing Mobile"
        name="Marketing · Mobile · Full page"
        component={MarketingSite}
        layout={{ x: 1540, y: 0, width: 390, height: 12416 }}
      />

      <Storyboard
        id="Dashboard Desktop"
        name="Dashboard · Desktop"
        component={() => <DashboardScreen shellHeight="1260px" />}
        layout={{ x: -743, y: 13636, width: 1440, height: 1260 }}
      />
      <Storyboard
        id="Dashboard Mobile"
        name="Dashboard · Mobile"
        component={() => <DashboardScreen shellHeight="1768px" />}
        layout={{ x: 810, y: 13636, width: 390, height: 1768 }}
      />

      <Storyboard
        id="Invoices Desktop"
        name="Invoice List · Desktop"
        component={InvoiceListScreen}
        layout={{ x: 1313, y: 13636, width: 1440, height: 1260 }}
      />
      <Storyboard
        id="Invoices Mobile"
        name="Invoice List · Mobile"
        component={InvoiceListScreen}
        layout={{ x: 2866, y: 13636, width: 390, height: 1149 }}
      />

      <Storyboard
        id="Create Invoice Desktop"
        name="Create Invoice · Desktop"
        component={CreateInvoiceScreen}
        layout={{ x: 3369, y: 13636, width: 1440, height: 1860 }}
      />
      <Storyboard
        id="Create Invoice Mobile"
        name="Create Invoice · Mobile"
        component={() => <CreateInvoiceScreen shellHeight="2826px" />}
        layout={{ x: 4922, y: 13636, width: 390, height: 2826 }}
      />
    </Canvas>
  );
}
