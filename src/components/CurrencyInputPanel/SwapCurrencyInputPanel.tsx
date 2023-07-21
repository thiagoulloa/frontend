// import { Trans } from '@lingui/macro'
import { ButtonBase, styled, useTheme } from "@mui/material"
import { flexColumnNoWrap, flexRowNoWrap } from "../../themes/styles"
import React, { useCallback, useState } from "react"
import { useSorobanReact } from "@soroban-react/core"
import { Input as NumericalInput } from '../NumericalInput'
import { LoadingOpacityContainer, loadingOpacityMixin } from "../Loader/styled"
import { RowBetween, RowFixed } from "../Row"
import { TokenType } from "../../interfaces"
import CurrencyLogo from "../Logo/CurrencyLogo"
import { ChevronDown } from "react-feather"
import { opacify } from '../../themes/utils'
import { darken } from "polished"
import { BodySmall } from "../Text"
import CurrencySearchModal from "../SearchModal/CurrencySearchModal"
import { FiatValue } from "./FiatValue"
import { useFormattedTokenBalance, useTokenBalance } from "hooks"

const InputPanel = styled('div')<{ hideInput?: boolean }>`
  ${flexColumnNoWrap};
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  transition: height 1s ease;
  will-change: height;
`

const FixedContainer = styled('div')`
  width: 100%;
  height: 100%;
  position: absolute;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`

const Container = styled('div')<{ hideInput: boolean }>`
  min-height: 44px;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
`

const CurrencySelect = styled(ButtonBase)<{
  visible: boolean
  selected: boolean
  hideInput?: boolean
  disabled?: boolean
}>`
  align-items: center;
  background-color: ${({ selected, theme }) => (selected ? theme.palette.customBackground.interactive : theme.palette.custom.borderColor)};
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  color: ${({theme}) => theme.palette.primary.main};
  height: unset;
  border-radius: 16px;
  outline: none;
  user-select: none;
  border: none;
  font-size: 24px;
  font-weight: 400;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: ${({ selected }) => (selected ? '4px 8px 4px 4px' : '6px 6px 6px 8px')};
  gap: 8px;
  justify-content: space-between;
  margin-left: ${({ hideInput }) => (hideInput ? '0' : '12px')};

  &:hover,
  &:active {
    background-color: ${({ theme, selected }) => (selected ? theme.palette.customBackground.interactive : theme.palette.custom.borderColor)};
  }

  &:before {
    background-size: 100%;
    border-radius: inherit;

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    content: '';
  }

  &:hover:before {
    background-color: ${({ theme }) => opacify(8, theme.palette.secondary.main)};
  }

  &:active:before {
    background-color: ${({ theme }) => opacify(24, theme.palette.secondary.light)};
  }

  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
`

const InputRow = styled('div')`
  ${flexRowNoWrap};
  align-items: center;
  justify-content: space-between;
`

const LabelRow = styled('div')`
  ${flexRowNoWrap};
  align-items: center;
  color: ${({ theme }) => theme.palette.secondary.main};
  font-size: 0.75rem;
  line-height: 1rem;

  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.palette.secondary.main)};
  }
`

const FiatRow = styled(LabelRow)`
  justify-content: flex-end;
  min-height: 20px;
  padding: 8px 0px 0px 0px;
`

const Aligner = styled('span')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const StyledDropDown = styled(ChevronDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.35rem;
  height: 35%;
  margin-left: 8px;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.palette.primary.main : "#FFF")};
    stroke-width: 2px;
  }
`

const StyledTokenName = styled('span')<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size: 20px;
  font-weight: 600;
`

const StyledBalanceMax = styled('button')<{ disabled?: boolean }>`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.palette.custom.borderColor};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  padding: 4px 6px;
  pointer-events: ${({ disabled }) => (!disabled ? 'initial' : 'none')};

  :hover {
    opacity: ${({ disabled }) => (!disabled ? 0.8 : 0.4)};
  }

  :focus {
    outline: none;
  }
`

const StyledNumericalInput = styled(NumericalInput)<{ $loading: boolean }>`
  ${loadingOpacityMixin};
  text-align: left;
  font-size: 36px;
  line-height: 44px;
  font-variant: small-caps;
`

interface SwapCurrencyInputPanelProps {
  value: any
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: string
  onCurrencySelect?: (currency: TokenType) => void
  currency?: TokenType | null
  hideBalance?: boolean
  hideInput?: boolean
  otherCurrency?: TokenType | null
  fiatValue?: { data?: number; isLoading: boolean }
  priceImpact?: string
  id: string
  showCommonBases?: boolean
  showCurrencyAmount?: boolean
  disableNonToken?: boolean
  renderBalance?: (amount: string) => string
  locked?: boolean
  loading?: boolean
  disabled?: boolean
}

export default function SwapCurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  onCurrencySelect,
  currency,
  otherCurrency,
  id,
  showCommonBases,
  showCurrencyAmount,
  disableNonToken,
  renderBalance,
  fiatValue,
  priceImpact,
  hideBalance = false,
  hideInput = false,
  locked = false,
  loading = false,
  disabled = false,
  ...rest
}: SwapCurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { address, activeChain } = useSorobanReact()
  const selectedCurrencyBalance = 1000 //useFormattedTokenBalance(currency?.token_address, address)
  const theme = useTheme()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const chainAllowed = true //isSupportedChain(activeChain)

  return (
    <InputPanel id={id} hideInput={hideInput} {...rest}>
      <Container hideInput={hideInput}>
        <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}}>
          {!hideInput && (
            <StyledNumericalInput
              className="token-amount-input"
              value={value}
              onUserInput={onUserInput}
              disabled={!chainAllowed || disabled}
              $loading={loading}
            />
          )}
          <CurrencySelect
            disabled={!chainAllowed || disabled}
            visible={currency !== undefined}
            selected={!!currency}
            hideInput={hideInput}
            className="open-currency-select-button"
            onClick={() => {
              if (onCurrencySelect) {
                setModalOpen(true)
              }
            }}
          >
            <Aligner>
              <RowFixed>
                { currency ? (
                  <CurrencyLogo style={{ marginRight: '2px' }} currency={currency} size="24px" />
                ) : null}
                <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.token_symbol)}>
                  {(currency && currency.token_symbol && currency.token_symbol.length > 20
                    ? currency.token_symbol.slice(0, 4) +
                      '...' +
                      currency.token_symbol.slice(currency.token_symbol.length - 5, currency.token_symbol.length)
                    : currency?.token_symbol) || 'Select token'}
                </StyledTokenName>
              </RowFixed>
              {onCurrencySelect && <StyledDropDown selected={!!currency} />}
            </Aligner>
          </CurrencySelect>
        </InputRow>
        {Boolean(!hideInput && !hideBalance) && (
          <FiatRow>
            <RowBetween>
              <LoadingOpacityContainer $loading={loading}>
                {fiatValue && <FiatValue fiatValue={fiatValue} />}
              </LoadingOpacityContainer>
              {address ? (
                <RowFixed style={{ height: '17px' }}>
                  <BodySmall
                    color={theme.palette.secondary.main}
                  >
                    {!hideBalance && currency && selectedCurrencyBalance ? (
                      `Balance: ${selectedCurrencyBalance}`
                    ) : null}
                  </BodySmall>
                  {showMaxButton && Number(selectedCurrencyBalance) > 0 ? (
                    <StyledBalanceMax onClick={onMax}>
                      Max
                    </StyledBalanceMax>
                  ) : null}
                </RowFixed>
              ) : (
                <span />
              )}
            </RowBetween>
          </FiatRow>
        )}
      </Container>
      {onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
          showCurrencyAmount={showCurrencyAmount}
          disableNonToken={disableNonToken}
        />
      )}
    </InputPanel>
  )
}
