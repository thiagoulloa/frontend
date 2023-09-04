import { AutoColumn, ColumnCenter } from "components/Column";
import CurrencyInputPanel from "components/CurrencyInputPanel";
import { Plus } from "react-feather";
import { Typography, useTheme } from "@mui/material";
import AppBody from "components/AppBody";
import { AddRemoveTabs } from "components/NavigationTabs";
import { Wrapper } from "components/Pool/styleds";
import { BlueCard } from "components/Card";
import { SubHeader } from "components/Text";
import { useCallback, useMemo } from "react";
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from "state/mint/hooks";
import { useTokens, useToken } from "hooks";
import { useSorobanReact } from '@soroban-react/core'
import { Field } from "state/mint/actions";
import { ButtonError, ButtonLight } from "components/Buttons/Button";
import depositOnContract from "functions/depositOnContract";
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { TokenType } from "interfaces";
import { useRouter } from 'next/router';


type TokensType = [string, string];

export default function AddLiquidityPage() {
  const router = useRouter();
  const { tokens } = router.query as { tokens: TokensType };
  console.log("pages/add tokens:", tokens)

  const [currencyIdA, currencyIdB] = Array.isArray(tokens) ? tokens : ['', ''];
  console.log("typeof tokens:", typeof tokens)
  // const {
  //   dependentField,
  //   currencies,
  //   pair,
  //   pairState,
  //   currencyBalances,
  //   parsedAmounts,
  //   price,
  //   noLiquidity,
  //   liquidityMinted,
  //   poolTokenPercentage,
  //   error,
  // } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)

  const sorobanContext = useSorobanReact()

  const currencyA = useToken(currencyIdA)
  const currencyB = useToken(currencyIdB)

  const navigate = useCallback((destination: any) => { router.push(destination) }, [router]
  )
  console.log("pages/add, currencyA, currencyB", currencyA, currencyB)

  const derivedMintInfo = useDerivedMintInfo(
    currencyA ? currencyA : undefined,
    currencyB ? currencyB : undefined)
  // const derivedMintInfo = useDerivedMintInfo(tokens[0], tokens[1])
  const { dependentField, currencies } = derivedMintInfo
  console.log("pages/add derivedMintInfo:", derivedMintInfo)
  const noLiquidity = true
  const isCreate = false

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

  const { independentField, typedValue, otherTypedValue } = useMintState()

  const formattedAmounts = useMemo(() => {
    return {
      [independentField]: typedValue,
      // [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
      [dependentField]: otherTypedValue
    }
  }, [dependentField, independentField, otherTypedValue, typedValue])


  const provideLiquidity = useCallback(() => {
    depositOnContract({
      sorobanContext,
      pairAddress: derivedMintInfo.pairAddress,
      amount0: formattedAmounts[independentField],
      amount1: formattedAmounts[dependentField],
    })
  }, [dependentField, derivedMintInfo.pairAddress, formattedAmounts, independentField, sorobanContext])

  const handleCurrencyASelect = useCallback(
    (currencyA: TokenType) => {
      const newCurrencyIdA = currencyA.address
      if (newCurrencyIdA === currencyIdB) {
        navigate(`/add/${currencyIdB}/${currencyIdA}`)
      } else {
        navigate(`/add/${newCurrencyIdA}/${currencyIdB}`)
      }
    },
    [currencyIdB, navigate, currencyIdA]
  )
  const handleCurrencyBSelect = useCallback(
    (currencyB: TokenType) => {
      const newCurrencyIdB = currencyB.address
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          navigate(`/add/${currencyIdB}/${newCurrencyIdB}`)
        } else {
          navigate(`/add/${newCurrencyIdB}`)
        }
      } else {
        navigate(`/add/${currencyIdA ? currencyIdA : 'ETH'}/${newCurrencyIdB}`)
      }
    },
    [currencyIdA, navigate, currencyIdB]
  )
  const theme = useTheme()
  return (
    <>
      <AppBody>
        <AddRemoveTabs creating={false} adding={true} autoSlippage={"DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE"} />
        <Wrapper>
          {/* <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash}
            // reviewContent={() => (
            //   <ConfirmationModalContent
            //     title={noLiquidity ? <>You are creating a pool</> : <>You will receive</>}
            //     onDismiss={handleDismissConfirmation}
            //     topContent={modalHeader}
            //     bottomContent={modalBottom}
            //   />
            // )}
            pendingText={pendingText}
            currencyToAdd={pair?.liquidityToken}
          /> */}
          <AutoColumn gap="20px">
            {noLiquidity ||
              (isCreate ? (
                <ColumnCenter>
                  <BlueCard>
                    <AutoColumn gap="10px">
                      <SubHeader fontWeight={600} color="accentAction">
                        <>You are the first liquidity provider.</>
                      </SubHeader>
                      <SubHeader fontWeight={400} color="accentAction">
                        <>The ratio of tokens you add will set the price of this pool.</>
                      </SubHeader>
                      <SubHeader fontWeight={400} color="accentAction">
                        <>Once you are happy with the rate click supply to review.</>
                      </SubHeader>
                    </AutoColumn>
                  </BlueCard>
                </ColumnCenter>
              ) : (
                <ColumnCenter>
                  <BlueCard>
                    <AutoColumn gap="10px">
                      <SubHeader fontWeight={400} color="accentAction">
                        <>
                          <b>
                            <>Tip:</>
                          </b>{' '}
                          When you add liquidity, you will receive pool tokens representing your position. These tokens
                          automatically earn fees proportional to your share of the pool, and can be redeemed at any
                          time.
                        </>
                      </SubHeader>
                    </AutoColumn>
                  </BlueCard>
                </ColumnCenter>
              ))}
            <CurrencyInputPanel
              value={formattedAmounts[Field.CURRENCY_A]}
              onUserInput={onFieldAInput}
              // onMax={() => {
              //   onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
              // }}
              onCurrencySelect={handleCurrencyASelect}
              showMaxButton={false}
              currency={currencies[Field.CURRENCY_A] ?? null}
              // currency={null}
              id="add-liquidity-input-tokena"
            // showCommonBases
            />
            <ColumnCenter>
              <Plus size="16" color={theme.palette.secondary.main} />
            </ColumnCenter>
            <CurrencyInputPanel
              value={formattedAmounts[Field.CURRENCY_B]}
              onUserInput={onFieldBInput}
              onCurrencySelect={handleCurrencyBSelect}
              // onMax={() => {
              //   onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
              // }}
              showMaxButton={false}
              currency={currencies[Field.CURRENCY_B] ?? null}
              // currency={currencies[Field.CURRENCY_A] ?? null}
              // currency={null}
              id="add-liquidity-input-tokenb"
            // showCommonBases
            />
            {/* {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState !== PairState.INVALID && (
              <>
                <LightCard padding="0px" $borderRadius="20px">
                  <RowBetween padding="1rem">
                    <DeprecatedSubHeader fontWeight={500} fontSize={14}>
                      {noLiquidity ? (
                        <>Initial prices and pool share</>
                      ) : (
                        <>Prices and pool share</>
                      )}
                    </DeprecatedSubHeader>
                  </RowBetween>{' '}
                  <LightCard padding="1rem" $borderRadius="20px">
                    <PoolPriceBar
                      currencies={currencies}
                      poolTokenPercentage={poolTokenPercentage}
                      noLiquidity={noLiquidity}
                      price={price}
                    />
                  </LightCard>
                </LightCard>
              </>
            )} */}

            {/* {addIsUnsupported ? (
              <ButtonPrimary disabled={true}>
                <DeprecatedMain mb="4px">
                  <>Unsupported Asset</>
                </DeprecatedMain>
              </ButtonPrimary>
            ) : !account ? (
              <TraceEvent
                events={[BrowserEvent.onClick]}
                name={InterfaceEventName.CONNECT_WALLET_BUTTON_CLICKED}
                properties={{ received_swap_quote: false }}
                element={InterfaceElementName.CONNECT_WALLET_BUTTON}
              >
                <ButtonLight onClick={toggleWalletDrawer}>
                  <>Connect Wallet</>
                </ButtonLight>
              </TraceEvent>
            ) : (
              <AutoColumn gap="md">
                {(approvalA === ApprovalState.NOT_APPROVED ||
                  approvalA === ApprovalState.PENDING ||
                  approvalB === ApprovalState.NOT_APPROVED ||
                  approvalB === ApprovalState.PENDING) &&
                  isValid && (
                    <RowBetween>
                      {approvalA !== ApprovalState.APPROVED && (
                        <ButtonPrimary
                          onClick={approveACallback}
                          disabled={approvalA === ApprovalState.PENDING}
                          width={approvalB !== ApprovalState.APPROVED ? '48%' : '100%'}
                        >
                          {approvalA === ApprovalState.PENDING ? (
                            <Dots>
                              <>Approving {currencies[Field.CURRENCY_A]?.symbol}</>
                            </Dots>
                          ) : (
                            <>Approve {currencies[Field.CURRENCY_A]?.symbol}</>
                          )}
                        </ButtonPrimary>
                      )}
                      {approvalB !== ApprovalState.APPROVED && (
                        <ButtonPrimary
                          onClick={approveBCallback}
                          disabled={approvalB === ApprovalState.PENDING}
                          width={approvalA !== ApprovalState.APPROVED ? '48%' : '100%'}
                        >
                          {approvalB === ApprovalState.PENDING ? (
                            <Dots>
                              <>Approving {currencies[Field.CURRENCY_B]?.symbol}</>
                            </Dots>
                          ) : (
                            <>Approve {currencies[Field.CURRENCY_B]?.symbol}</>
                          )}
                        </ButtonPrimary>
                      )}
                    </RowBetween>
                  )}
                <ButtonError
                  onClick={() => {
                    setShowConfirm(true)
                  }}
                  disabled={!isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
                  error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                >
                  <Text fontSize={20} fontWeight={500}>
                    {error ?? <>Supply</>}
                  </Text>
                </ButtonError>
              </AutoColumn>
            )} */}

            {!sorobanContext.address ? (

              <ButtonLight onClick={() => { }}>
                <>Connect Wallet</>
              </ButtonLight>
            ) : (
              <AutoColumn gap="md">
                <ButtonError
                  onClick={() => {
                    // setShowConfirm(true)
                    provideLiquidity()
                    console.log("pages/add: ButtonError onClick")
                  }}
                  disabled={false}
                  error={false}
                >
                  <Typography >
                    {<>Supply</>}
                  </Typography>
                </ButtonError>
              </AutoColumn>
            )}
          </AutoColumn>
        </Wrapper>
      </AppBody>
    </>
  );
}