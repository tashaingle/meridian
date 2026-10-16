import { LegalPage } from "@/components/legal";

export const metadata = { title: "Refunds" };

export default function RefundsPage() {
  return (
    <LegalPage title="Refunds">
      <p>
        No money is taken on this demonstration, so there is nothing to refund. A sample booking cannot be changed with
        an airline because no airline order exists.
      </p>
      <p>
        On each sample fare, the change and refund lines are illustrations of Light, Standard and Flex. They are not a
        promise from a carrier. A Duffel fare, if a token is connected, shows the condition text returned for that
        offer, and confirming checkout still does not create the order.
      </p>
      <p>
        A live service will need an approved refund route, a merchant of record, and a way for staff to see payment and
        ticket status together. That work is not switched on.
      </p>
    </LegalPage>
  );
}
