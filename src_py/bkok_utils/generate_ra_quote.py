from dstack_sdk import AsyncTappdClient, DeriveKeyResponse, TdxQuoteResponse

async def generate_ra_quote_async(subject: str) -> dict:
    endpoint = 'http://host.docker.internal:8090'   # TODO: remove this line when making a docker image
    client = AsyncTappdClient(endpoint=endpoint)
    try:
        deriveKey = await client.derive_key('/', subject=subject)
        asBytes = deriveKey.toBytes()
        tdxQuote = await client.tdx_quote(report_data=subject)
        return {"deriveKey": asBytes.hex(), "ra_quote": tdxQuote.quote}
    except Exception as e:
        return {"deriveKey": e, "ra_quote": ""}
    