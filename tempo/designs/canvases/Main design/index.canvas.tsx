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
        layout={{ x: 0, y: 0, width: 1440, height: 9800 }}
      />
      <Storyboard
        id="Marketing Mobile"
        name="Marketing · Mobile · Full page"
        component={MarketingSite}
        layout={{ x: 1540, y: 0, width: 390, height: 11800 }}
      />

      <Storyboard
        id="Dashboard Desktop"
        name="Dashboard · Desktop"
        component={DashboardScreen}
        layout={{ x: 0, y: 12343, width: 1440, height: 1280 }}
      />
      <Storyboard
        id="Dashboard Mobile"
        name="Dashboard · Mobile"
        component={DashboardScreen}
        layout={{ x: 1540, y: 11977, width: 390, height: 1900 }}
      />

      <Storyboard
        id="Invoices Desktop"
        name="Invoice List · Desktop"
        component={InvoiceListScreen}
        layout={{ x: 2056, y: 12343, width: 1440, height: 1260 }}
      />
      <Storyboard
        id="Invoices Mobile"
        name="Invoice List · Mobile"
        component={InvoiceListScreen}
        layout={{ x: 1540, y: 14200, width: 390, height: 1149 }}
      />

      <Storyboard
        id="Create Invoice Desktop"
        name="Create Invoice · Desktop"
        component={CreateInvoiceScreen}
        layout={{ x: 4112, y: 12343, width: 1440, height: 1860 }}
      />
      <Storyboard
        id="Create Invoice Mobile"
        name="Create Invoice · Mobile"
        component={CreateInvoiceScreen}
        layout={{ x: 1540, y: 15679, width: 390, height: 3000 }}
      />
    </Canvas>
  );
}
