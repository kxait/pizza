import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { requireUserWithIntent } from "~/session.server";
import { Intent } from "~/shared/enum/enum";

export async function loader({ request }: LoaderArgs) {
  await requireUserWithIntent(request, Intent.DELIVERY_SCREEN);

  return json({});
}

export default function Index() {
  return <div>hello</div>;
}
