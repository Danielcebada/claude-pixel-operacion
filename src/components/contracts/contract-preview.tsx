"use client";

import { formatCurrency } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Contract,
  PRESTADOR,
  fmtDate,
  fmtDateLong,
  getStatusColor,
  getStatusLabel,
  diasCreditoLabel,
  esquemaPagoLabel,
  formaPagoLabel,
} from "@/lib/contracts-data";

export function ContractPreview({ contract }: { contract: Contract }) {
  const ciudadFecha = `Ciudad de Mexico, a ${fmtDateLong(contract.createdAt)}`;
  const terms = contract.terms;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden print:ring-0 print:max-w-none">
      {/* Header bar */}
      <div className="bg-gray-900 text-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-lg font-bold">
              DP
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">DIGITAL PIXEL STUDIOS</h2>
              <p className="text-[10px] text-gray-400">Tecnologia Interactiva para Eventos</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-mono">
              #{contract.contractNumber}
            </p>
            <Badge
              variant="secondary"
              className={`mt-1 text-[10px] ${getStatusColor(contract.status)}`}
            >
              {getStatusLabel(contract.status)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Contract body */}
      <div className="px-8 py-8 space-y-6 text-[13px] leading-relaxed text-gray-700">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-base font-bold uppercase tracking-wider text-gray-900">
            Contrato de Prestacion de Servicios
          </h1>
          <p className="text-xs text-gray-500">{ciudadFecha}</p>
        </div>

        {/* Intro paragraph */}
        <p className="text-justify">
          Contrato de Prestacion de Servicios que celebran, por una parte, <strong>{PRESTADOR.razonSocial}</strong>,
          representada en este acto por el <strong>C. {PRESTADOR.representante}</strong>, en su
          caracter de Director General, a quien en lo sucesivo se le denominara{" "}
          <strong>&quot;EL PRESTADOR&quot;</strong>; y por la otra parte,{" "}
          <strong>{contract.clientName}</strong>, representada por el{" "}
          <strong>C. {contract.clientRepresentante}</strong>, en su caracter de{" "}
          {contract.clientRepresentanteCargo}, a quien en lo sucesivo se le denominara{" "}
          <strong>&quot;EL CLIENTE&quot;</strong>; y de manera conjunta como{" "}
          <strong>&quot;LAS PARTES&quot;</strong>, al tenor de las siguientes declaraciones y
          clausulas:
        </p>

        {/* ---- DECLARACIONES ---- */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-2">
            Declaraciones
          </h2>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">
              I. Declara EL PRESTADOR, a traves de su representante:
            </h3>
            <ol className="list-[lower-alpha] list-inside space-y-2 pl-2 text-justify">
              <li>
                Que es una sociedad mercantil legalmente constituida conforme a las leyes de los
                Estados Unidos Mexicanos, segun consta en la escritura publica correspondiente.
              </li>
              <li>
                Que su Registro Federal de Contribuyentes es <strong>{PRESTADOR.rfc}</strong>.
              </li>
              <li>
                Que el C. {PRESTADOR.representante} es su representante legal, con facultades
                suficientes para celebrar el presente contrato, las cuales no le han sido revocadas
                ni limitadas en forma alguna.
              </li>
              <li>
                Que tiene la capacidad tecnica, humana y material necesaria para prestar los
                servicios objeto del presente contrato.
              </li>
              <li>
                Que se encuentra al corriente en el cumplimiento de sus obligaciones fiscales.
              </li>
              <li>
                Que senala como su domicilio para todos los efectos legales del presente contrato
                el ubicado en: {PRESTADOR.domicilio}.
              </li>
            </ol>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">
              II. Declara EL CLIENTE, a traves de su representante:
            </h3>
            <ol className="list-[lower-alpha] list-inside space-y-2 pl-2 text-justify">
              <li>
                Que es una sociedad legalmente constituida conforme a las leyes de los Estados
                Unidos Mexicanos.
              </li>
              <li>
                Que su Registro Federal de Contribuyentes es{" "}
                <strong>{contract.clientRFC}</strong>.
              </li>
              <li>
                Que el C. {contract.clientRepresentante} cuenta con las facultades legales
                suficientes para obligarse en los terminos del presente contrato.
              </li>
              <li>
                Que es su deseo contratar los servicios de EL PRESTADOR en los terminos y
                condiciones que se establecen en el presente instrumento.
              </li>
              <li>
                Que senala como su domicilio para todos los efectos legales del presente contrato
                el ubicado en: {contract.clientDomicilio}.
              </li>
            </ol>
          </div>
        </div>

        {/* ---- CLAUSULAS ---- */}
        <div className="space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-2">
            Clausulas
          </h2>

          {/* PRIMERA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              PRIMERA. &mdash; Objeto del Contrato
            </h3>
            <p className="text-justify">
              EL PRESTADOR se obliga a proporcionar a EL CLIENTE los servicios de tecnologia
              interactiva y experiencias inmersivas descritos a continuacion, mismos que se
              detallan con mayor precision en el Anexo A que forma parte integral del presente
              contrato:
            </p>
            <p className="text-justify italic text-gray-600">
              {contract.descripcionServicio}
            </p>
            <div className="grid grid-cols-2 gap-4 my-3 text-xs">
              <div>
                <span className="text-gray-400">Fecha(s) del Evento:</span>{" "}
                <span className="font-medium">{fmtDateLong(contract.fechaEvento)}</span>
              </div>
              <div>
                <span className="text-gray-400">Ubicacion:</span>{" "}
                <span className="font-medium">{contract.ubicacionEvento}</span>
              </div>
              {terms && (
                <div>
                  <span className="text-gray-400">Lugar de entrega:</span>{" "}
                  <span className="font-medium">{terms.lugarEntrega}</span>
                </div>
              )}
            </div>

            {/* Desglose / Anexo A */}
            {contract.lineItems.length > 0 && (
              <>
                <p className="text-xs font-semibold text-gray-600 mt-4 mb-2">
                  Anexo A &mdash; Desglose de Servicios
                </p>
                <table className="w-full text-xs border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-2 px-2 font-semibold text-gray-600">#</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-600">Concepto</th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-600 w-14">Cant.</th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-600 w-14">Dias</th>
                      <th className="text-right py-2 px-2 font-semibold text-gray-600 w-24">P. Unitario</th>
                      <th className="text-right py-2 px-2 font-semibold text-gray-600 w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.lineItems.map((item, idx) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-2 px-2 text-gray-400">{idx + 1}</td>
                        <td className="py-2 px-2">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-[10px] text-gray-400">{item.category}</p>
                        </td>
                        <td className="text-center px-2">{item.quantity}</td>
                        <td className="text-center px-2">{item.days}</td>
                        <td className="text-right px-2 font-mono">{formatCurrency(item.unitPrice)}</td>
                        <td className="text-right px-2 font-mono font-medium">
                          {formatCurrency(item.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>

          {/* SEGUNDA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              SEGUNDA. &mdash; Contraprestacion y Forma de Pago
            </h3>
            <p className="text-justify">
              Como contraprestacion por los servicios descritos en la clausula primera, EL CLIENTE
              se obliga a pagar a EL PRESTADOR la cantidad total de{" "}
              <strong>{formatCurrency(contract.subtotal)} (antes de IVA)</strong>, mas el
              Impuesto al Valor Agregado (IVA
              {terms && terms.ivaPct !== 16 ? ` ${terms.ivaPct}%` : ""}) correspondiente de{" "}
              <strong>{formatCurrency(contract.iva)}</strong>, resultando un total de{" "}
              <strong>{formatCurrency(contract.total)}</strong>
              {terms && (terms.retencionISR || terms.retencionIVA) && (
                <>
                  . Sobre este monto se aplicaran las siguientes retenciones conforme a la
                  legislacion fiscal vigente:
                  {terms.retencionISR && " ISR 10%"}
                  {terms.retencionISR && terms.retencionIVA && ","}
                  {terms.retencionIVA && " IVA 10.67%"}
                </>
              )}
              {terms && (
                <>
                  . El esquema de pago acordado es{" "}
                  <strong>{esquemaPagoLabel(terms.esquemaPago)}</strong>, con condiciones de{" "}
                  <strong>{diasCreditoLabel(terms.diasCredito)}</strong>, mediante{" "}
                  <strong>{formaPagoLabel(terms.formaPago)}</strong>
                </>
              )}
              , conforme al siguiente calendario de pagos:
            </p>

            <table className="w-full text-xs border border-gray-200 my-3">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-semibold text-gray-600">Concepto</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-600 w-16">%</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-600 w-28">Monto</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-600 w-28">Fecha Limite</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-600 w-20">Estado</th>
                </tr>
              </thead>
              <tbody>
                {contract.paymentSchedule.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="py-1.5 px-2">{p.concepto}</td>
                    <td className="text-center px-2">{p.porcentaje}%</td>
                    <td className="text-right px-2 font-mono">{formatCurrency(p.monto)}</td>
                    <td className="text-center px-2 text-gray-500">{fmtDate(p.fechaLimite)}</td>
                    <td className="text-center px-2">
                      {p.pagado ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px]">
                          Pagado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-[10px]">
                          Pendiente
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-justify">
              Los pagos deberan realizarse{" "}
              {terms
                ? terms.formaPago === "transferencia"
                  ? "mediante transferencia electronica a la siguiente cuenta bancaria:"
                  : terms.formaPago === "cheque"
                  ? "mediante cheque nominativo a nombre del PRESTADOR. Datos para referencia bancaria:"
                  : "en efectivo en las oficinas de EL PRESTADOR. Datos bancarios de referencia:"
                : "mediante transferencia electronica a la siguiente cuenta bancaria:"}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 space-y-1 border border-gray-200">
              <p className="font-semibold text-gray-800">Datos Bancarios:</p>
              <p>Banco: {PRESTADOR.banco}</p>
              <p>Titular: {PRESTADOR.titular}</p>
              <p>Cuenta: {PRESTADOR.cuenta}</p>
              <p>CLABE Interbancaria: {PRESTADOR.clabe}</p>
            </div>
            {terms?.incluyeViaticos && (
              <p className="text-justify text-xs text-gray-600">
                Los viaticos, transporte foraneo y hospedaje del equipo operativo se encuentran
                incluidos en la contraprestacion establecida en esta clausula.
              </p>
            )}
          </div>

          {/* TERCERA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              TERCERA. &mdash; Obligaciones del Prestador
            </h3>
            <p className="text-justify">EL PRESTADOR se obliga a:</p>
            <ol className="list-[lower-alpha] list-inside space-y-2 pl-2 text-justify">
              <li>
                Prestar los servicios contratados de manera eficiente y profesional, con la
                calidad y en los tiempos acordados.
              </li>
              <li>
                Utilizar para la prestacion de los servicios a su propio personal, quien
                dependera exclusivamente de EL PRESTADOR, por lo que no se creara relacion laboral
                alguna entre dicho personal y EL CLIENTE.
              </li>
              <li>
                Entregar el equipo y tecnologia contratada en condiciones optimas de
                funcionamiento en la fecha y lugar acordados{terms?.lugarEntrega ? ` (${terms.lugarEntrega})` : ""}.
              </li>
              <li>
                Brindar soporte tecnico continuo durante el evento, incluyendo resolucion de
                fallas y contingencias.
              </li>
              <li>
                Responder por los danos y perjuicios que con motivo de los servicios cause a
                EL CLIENTE o a terceros, derivados de su negligencia o dolo.
              </li>
              <li>
                Realizar la entrega del material digital generado durante el evento en un plazo
                no mayor a 5 dias habiles posteriores al mismo.
              </li>
            </ol>
          </div>

          {/* CUARTA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              CUARTA. &mdash; Obligaciones del Cliente
            </h3>
            <p className="text-justify">EL CLIENTE se obliga a:</p>
            <ol className="list-[lower-alpha] list-inside space-y-2 pl-2 text-justify">
              <li>
                Realizar los pagos en tiempo y forma de acuerdo al esquema de pago establecido
                en la clausula segunda del presente contrato.
              </li>
              <li>
                Proporcionar acceso al venue o inmueble donde se realizara el evento con
                anticipacion minima de 4 horas para montaje, garantizando las condiciones tecnicas
                necesarias (conexion electrica dedicada de 110V/220V, espacio minimo requerido,
                area techada con altura minima de 2.5 metros).
              </li>
              <li>
                Designar un responsable de evento que sirva como punto de contacto con el equipo
                de EL PRESTADOR durante la vigencia del presente contrato.
              </li>
              <li>
                Facilitar toda la informacion y materiales necesarios para la correcta prestacion
                de los servicios.
              </li>
            </ol>
          </div>

          {/* QUINTA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              QUINTA. &mdash; Vigencia
            </h3>
            <p className="text-justify">
              El presente contrato tendra una vigencia del{" "}
              <strong>{fmtDateLong(contract.vigenciaInicio)}</strong> al{" "}
              <strong>{fmtDateLong(contract.vigenciaFin)}</strong>, pudiendo ser prorrogado por
              acuerdo escrito de LAS PARTES.
            </p>
          </div>

          {/* SEXTA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              SEXTA. &mdash; Confidencialidad
            </h3>
            <p className="text-justify">
              Ambas partes se comprometen a mantener estricta confidencialidad sobre la
              informacion comercial, tecnica y financiera intercambiada con motivo del presente
              contrato. Ninguna de las partes podra divulgar, reproducir o utilizar dicha
              informacion para fines distintos a los establecidos en este contrato, salvo
              autorizacion expresa por escrito de la otra parte. Esta obligacion subsistira aun
              despues de terminada la vigencia del contrato.
            </p>
          </div>

          {/* SEPTIMA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              SEPTIMA. &mdash; Propiedad Intelectual
            </h3>
            <p className="text-justify">
              Los derechos de propiedad intelectual sobre el software, disenos, desarrollos y
              material creativo generado por EL PRESTADOR en el marco del presente contrato seran
              propiedad de EL PRESTADOR, otorgando a EL CLIENTE una licencia de uso no exclusiva
              para los fines especificos del proyecto contratado. El material fotografico y
              audiovisual generado durante los eventos podra ser utilizado por ambas partes para
              fines promocionales, salvo acuerdo en contrario.
            </p>
          </div>

          {/* OCTAVA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              OCTAVA. &mdash; Terminacion Anticipada
            </h3>
            <p className="text-justify">
              Cualquiera de LAS PARTES podra dar por terminado anticipadamente el presente
              contrato mediante aviso por escrito dirigido a la otra parte con al menos 15
              (quince) dias naturales de anticipacion, sin responsabilidad alguna, salvo la
              obligacion de cubrir los pagos por servicios efectivamente prestados y los gastos
              comprometidos a la fecha de terminacion.
            </p>
          </div>

          {/* NOVENA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              NOVENA. &mdash; Penalizaciones por Cancelacion
            </h3>
            <p className="text-justify">
              En caso de que EL CLIENTE decida cancelar el presente contrato, se aplicara una
              penalidad equivalente al{" "}
              <strong>{terms?.penalidadCancelacionPct ?? 30}% del monto total del contrato</strong>
              , ademas de las siguientes condiciones respecto del anticipo pagado:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-xs border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <p>
                  <span className="font-semibold">Cancelacion con mas de 15 dias naturales de anticipacion:</span>{" "}
                  Devolucion del 80% del anticipo pagado.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                <p>
                  <span className="font-semibold">Cancelacion con 8 a 15 dias naturales de anticipacion:</span>{" "}
                  Devolucion del 50% del anticipo pagado.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <p>
                  <span className="font-semibold">Cancelacion con menos de 8 dias naturales de anticipacion:</span>{" "}
                  No aplica devolucion del anticipo.
                </p>
              </div>
            </div>
            <p className="text-justify">
              La reprogramacion del evento estara sujeta a disponibilidad de equipo y personal de
              EL PRESTADOR, sin costo adicional siempre que se notifique con al menos 10 dias
              habiles de anticipacion.
            </p>
          </div>

          {/* DECIMA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              DECIMA. &mdash; Jurisdiccion
            </h3>
            <p className="text-justify">
              Para la interpretacion y cumplimiento del presente contrato, LAS PARTES se someten
              expresamente a la jurisdiccion de los tribunales competentes de la Ciudad de Mexico,
              renunciando a cualquier otro fuero que por razon de sus domicilios presentes o
              futuros pudiera corresponderles.
            </p>
          </div>
        </div>

        {/* ---- FIRMAS ---- */}
        <div className="pt-6">
          <p className="text-justify mb-8">
            Leido que fue el presente contrato por LAS PARTES y enteradas de su contenido y
            alcance legal, lo firman por duplicado en la Ciudad de Mexico, a{" "}
            {fmtDateLong(contract.createdAt)}.
          </p>

          <div className="grid grid-cols-2 gap-16 pt-4">
            <div className="text-center">
              <div className="border-b border-gray-300 mb-3 h-20" />
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                EL PRESTADOR
              </p>
              <p className="text-sm font-bold">{PRESTADOR.razonSocial}</p>
              <p className="text-xs text-gray-700 mt-1">
                {PRESTADOR.representante}
              </p>
              <p className="text-xs text-gray-500">Director General</p>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-300 mb-3 h-20" />
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                EL CLIENTE
              </p>
              <p className="text-sm font-bold">{contract.clientName}</p>
              <p className="text-xs text-gray-700 mt-1">
                {contract.clientRepresentante}
              </p>
              <p className="text-xs text-gray-500">{contract.clientRepresentanteCargo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 bg-gray-900 text-center">
        <p className="text-[10px] text-gray-400">
          {PRESTADOR.razonSocial} | RFC: {PRESTADOR.rfc} | {PRESTADOR.domicilio}
        </p>
      </div>
    </div>
  );
}
