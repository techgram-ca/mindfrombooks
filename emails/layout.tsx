import { MarkdownBody } from "./markdown";

export interface EmailProps {
  preview: string;
  body: string;
  buttonLabel?: string;
  buttonUrl?: string;
  unsubscribeUrl?: string | null;
  siteUrl: string;
}

/**
 * One branded, mobile-friendly layout for every email. Table-based with inline
 * styles so it renders the same in Gmail, Apple Mail and Outlook.
 */
export function EmailLayout({
  preview,
  body,
  buttonLabel,
  buttonUrl,
  unsubscribeUrl,
  siteUrl,
}: EmailProps) {
  const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
  return (
    <html lang="en">
      {/* eslint-disable-next-line @next/next/no-head-element -- this is an email, not a page */}
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#fbf7f0", fontFamily: font }}>
        <div style={{ display: "none", maxHeight: 0, overflow: "hidden", opacity: 0 }}>
          {preview}
        </div>
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ background: "#fbf7f0" }}
        >
          <tbody>
            <tr>
              <td align="center" style={{ padding: "32px 16px" }}>
                <table
                  role="presentation"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ maxWidth: 520 }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          padding: "0 4px 20px",
                          fontFamily: "Georgia, 'Times New Roman', serif",
                          fontSize: 22,
                          fontWeight: 700,
                          color: "#172033",
                        }}
                      >
                        mind<span style={{ color: "#8a5a12" }}>from</span>books
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e7ddcc",
                          borderRadius: 16,
                          padding: "28px 24px",
                        }}
                      >
                        <MarkdownBody text={body} />
                        {buttonLabel && buttonUrl && (
                          <table
                            role="presentation"
                            cellPadding={0}
                            cellSpacing={0}
                            style={{ marginTop: 8 }}
                          >
                            <tbody>
                              <tr>
                                <td style={{ background: "#172033", borderRadius: 999 }}>
                                  <a
                                    href={buttonUrl}
                                    style={{
                                      display: "inline-block",
                                      padding: "13px 26px",
                                      color: "#fbf7f0",
                                      fontSize: 16,
                                      fontWeight: 600,
                                      textDecoration: "none",
                                      fontFamily: font,
                                    }}
                                  >
                                    {buttonLabel}
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "20px 4px 0",
                          fontSize: 13,
                          lineHeight: "20px",
                          color: "#586175",
                        }}
                      >
                        Books teach. Daily action changes you.
                        <br />
                        <a href={siteUrl} style={{ color: "#586175" }}>
                          mindfrombooks
                        </a>
                        {unsubscribeUrl && (
                          <>
                            {" · "}
                            <a href={unsubscribeUrl} style={{ color: "#586175" }}>
                              Unsubscribe from daily reminders
                            </a>
                          </>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
