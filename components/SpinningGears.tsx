import { IconSettings, IconSettingsFilled } from "@tabler/icons-react";
import styles from "@/app/styles/gearAnimation.module.css";

export function SpinningGears() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
      <IconSettings className={styles.gearSpin} size={96} />
      <IconSettingsFilled
        className={`${styles.gearSpinReverse} block -ml-1`}
        size={54}
      />
    </div>
  );
}
