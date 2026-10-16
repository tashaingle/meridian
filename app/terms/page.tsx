import { LegalPage } from "@/components/legal";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <p>
        Meridian is a demonstration of an international flight booking website. It does not sell travel, hold seats, or
        issue tickets. A booking reference on this site is a record of the demonstration only.
      </p>
      <p>
        Before any live sale, the selling business must publish its legal name, country of establishment, the contract
        you enter, the fare rules supplied by the airline, and the complaints process. Those details are not final.
      </p>
      <p>
        Sample fares can be wrong compared with a real airline. Live supplier fares, once connected, can still change
        until the supplier confirms the order. You should read the fare conditions shown before you continue.
      </p>
      <p>
        The demonstration asks you not to enter a real passport number or a real payment card. Use the sample card
        shown at checkout.
      </p>
    </LegalPage>
  );
}
