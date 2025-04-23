import { graphql } from "@mysten/sui/graphql/schemas/latest"

const queryWealthDataContext = graphql(`
    query queryWealthDataContext($address:SuiAddress!) {
        object(address:$address){
            dynamicFields{
                nodes{
                    name{
                        json
                    }
                    value{
                    ...on MoveValue{
                            json
                        }
                    }
                }
            }
        }
    }
`)

export default queryWealthDataContext;