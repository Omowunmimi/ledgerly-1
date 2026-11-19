import { Canvas, Storyboard } from "tempo-sdk/canvas";
import { defineAsset } from "tempo-sdk/assets";
import { IconographyPack } from "../../../../src/components/system";

export default function LedgerlyIconographyCanvas() {
  return (
    <Canvas name="Ledgerly Iconography" backgroundColor="#F5F7F6">
      <Storyboard
        id="LedgerlyIconography"
        name="Iconography · Lucide line set"
        component={IconographyPack}
        layout={{ x: 0, y: 0, width: 960, height: 420 }}
      />
    </Canvas>
  );
}

defineAsset(LedgerlyIconographyCanvas, {
  libraries: ["Ledgerly Design System"],
  usageInstructions:
    "Use this foundations page as the canonical Ledgerly Lucide line-icon inventory. Reuse existing glyphs for navigation, invoice actions, activity and status before introducing another icon.",
});
