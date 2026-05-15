import { NextResponse } from "next/server";

const CAFE_LAT = 51.4308;

const CAFE_LNG = 6.8797;

function getDistanceKm(

  lat1: number,

  lon1: number,

  lat2: number,

  lon2: number

) {

  const R = 6371;

  const dLat =

    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =

    ((lon2 - lon1) * Math.PI) / 180;

  const a =

    Math.sin(dLat / 2) *

      Math.sin(dLat / 2) +

    Math.cos((lat1 * Math.PI) / 180) *

      Math.cos((lat2 * Math.PI) / 180) *

      Math.sin(dLon / 2) *

      Math.sin(dLon / 2);

  const c =

    2 *

    Math.atan2(

      Math.sqrt(a),

      Math.sqrt(1 - a)

    );

  return R * c;

}

export async function POST(req: Request) {

  try {

    const { address } = await req.json();

    if (!address) {

      return NextResponse.json(

        {

          error: "No address",

        },

        { status: 400 }

      );

    }

    // geocoding

    const geoRes = await fetch(

      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(

        address

      )}&format=json&limit=1`,

      {

        headers: {

          "User-Agent":

            "ERET Cafe Delivery System",

        },

      }

    );

    const geoData = await geoRes.json();

    if (!geoData.length) {

      return NextResponse.json({

        available: false,

        message:

          "Adresse nicht gefunden",

      });

    }

    const lat = Number(geoData[0].lat);

    const lon = Number(geoData[0].lon);

    const distance = getDistanceKm(

      CAFE_LAT,

      CAFE_LNG,

      lat,

      lon

    );

    // pricing

    let fee = 0;

    let available = true;

    if (distance <= 3) {

      fee = 2.9;

    } else if (distance <= 5) {

      fee = 3.9;

    } else {

      available = false;

    }

    return NextResponse.json({

      available,

      distance:

        distance.toFixed(2),

      fee,

    });

  } catch (err) {

    console.error(err);

    return NextResponse.json(

      {

        error: "Server error",

      },

      { status: 500 }

    );

  }

}